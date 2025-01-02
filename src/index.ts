import { onMinuteAsync } from './service/service.js'
import { accounts, assets, world, market, current, posts } from './service/model.js'
import { app } from './service/api.js'
import { ChannelsView, PostsView, PostView } from './views/posts.js'
import { MarketStatsView, MarketplaceView } from './views/market.js'
import { HeaderView } from './views/header.js'
import { AuthView, LeaderboardView, InventoryView, ProfileView } from './views/accounts.js'
import { FooterView } from './views/footer.js'
import { ActivitiesView, AssetsView } from './views/world.js'
import 'dotenv/config'
import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Request, Response } from 'express'
import { Account, Listing, Post } from './types.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`starting worldcore service..`)
const port = process.env.PORT || 9000

const server = port == 9000 ? app : https.createServer({
    key: fs.readFileSync(path.join(__dirname, `./private/private.key`)),
    cert: fs.readFileSync(path.join(__dirname, `./private/public.cert`))
}, app)

server.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

setInterval(async () => await onMinuteAsync(), world.interval.minute)

app.get('/', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string
    const account: Account | undefined = accounts.find(a => a.id == username)

    const headerHtml = HeaderView(session, username)

    /**
     * World Overview
     */
    if (!req.query.user) {
        const leaderboardHtml = LeaderboardView()
        const blogHtml = PostsView()

        res.send(`
        ${headerHtml}
        ${!session.username ? AuthView() : ``}

        ${leaderboardHtml}
        ${blogHtml}
        
        ${FooterView()}`)
        return
    }

    /**
     * Account Overview
     */
    if (!account) {
        res.send(404)
        return
    }

    let listings: Listing[] = market.filter(l => !l.times.sold && !l.times.expired && l.owner == username)
        .sort((a, b) => a.price / a.amount < b.price / b.amount ? 1 : -1)
        .sort((a, b) => a.amount < b.amount ? 1 : -1)
    
    const marketplaceHtml = MarketplaceView(listings, username, session)

    res.send(`${headerHtml}
        <div class="lg:flex flex-row-reverse">
            <div class="lg:flex-auto">
                ${ProfileView(username, account, session)}
            </div>
            <div class="lg:flex-auto">
                ${marketplaceHtml}
            </div>
        </div>
        ${FooterView()}`)
        return
})

app.get('/leaderboard', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username
    const account: Account | undefined = accounts.find(a => a.id == username)

    const headerHtml = HeaderView(session, req.session.username as string)
    const leaderboardHtml = LeaderboardView()
    res.send(`
        ${headerHtml}
        ${leaderboardHtml}
        ${FooterView()}
    `)
})

app.get('/explorer', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string
    const account: Account | undefined = accounts.find(a => a.id == username)
    
    const headerHtml = HeaderView(session, username)

    let html = req.query.type == 'item' ? AssetsView() : ActivitiesView()
    res.send(`
        ${headerHtml}
        ${html}
        ${FooterView()}
    `)
})

app.get('/mints', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string
    
    const headerHtml = HeaderView(session, username)
    const assetsHtml = AssetsView()
    res.send(`
        ${headerHtml}
        ${assetsHtml}
        ${FooterView()}
    `)
})

app.get('/marketplace', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string

    const headerHtml = HeaderView(session, username)

    const listings: Listing[] = market.filter(l => !l.times.sold && !l.times.expired)
    .sort((a, b) => a.price / a.amount < b.price / b.amount ? 1 : -1)
    .sort((a, b) => a.amount < b.amount ? 1 : -1)

    const marketplaceHtml = MarketplaceView(listings, username, session)
    res.send(`
        ${headerHtml}
        ${marketplaceHtml}
        ${FooterView()}
    `)
})

app.get('/posts', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string

    const headerHtml = HeaderView(session, username)
    const postsView = PostsView(req.query.channel as string)
    res.send(`
        ${headerHtml}
        ${postsView}
        ${FooterView()}
    `)
})

app.get('/post', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string

    if (!req.query.id) {
        console.error(`invalid request`)
        res.sendStatus(400)
        return
    }

    const post: Post | undefined = posts.find(p => p.id == req.query.id)
    if (!post) {
        console.error(`post ${req.query.id} not found`)
        res.sendStatus(404)
        return
    }

    const headerHtml = HeaderView(session, username)
    const postHtml = PostView(post, session)
    
    res.send(`
        ${headerHtml}
        ${postHtml}
        ${FooterView()}
    `)
})

app.get('/channels', (req: Request, res: Response) => {
    const session = req.session
    const username = req.query.user ? req.query.user as string : req.session.username as string

    res.send(`
        ${HeaderView(session, username)}
        ${ChannelsView()}
        ${FooterView()}
    `)
})