import { onMinuteAsync } from './service/service.js'
import { accounts, assets, world, market, current, posts } from './service/model.js'
import { app } from './service/api.js'
import { ChannelsView, PostsView, PostView } from './views/posts.js'
import { MarketStatsView, MarketplaceView } from './views/market.js'
import { HeaderView } from './views/header.js'
import { AuthView,  LeaderboardView, InventoryView, ProfileView } from './views/accounts.js'
import { FooterView } from './views/footer.js'
import { ActivitiesView, AssetsView } from './views/world.js'
import 'dotenv/config'
import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'
import { fileURLToPath } from 'url'

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

setInterval(await onMinuteAsync, world.interval.minute)

app.get('/', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    const headerHtml = HeaderView(session, username)

    /**
     * World Overview
     */
    if (!req.query.user) {
        const leaderboardHtml = LeaderboardView()
        const blogHtml = PostsView()

        res.send(`
        ${headerHtml}
        ${!session.username? AuthView() : ``}

        ${leaderboardHtml}
        ${blogHtml}
        
        ${FooterView()}`)
        return
    }

    /**
     * Account Overview
     */

    let listings = market.filter(l => !l.times.sold && !l.times.expired)
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    if (session.username != username) listings = listings.filter(l => l.owner == username)
    const marketplaceHtml = MarketplaceView(listings, username, session, account)

    res.send(`${headerHtml}
        <div class="lg:flex flex-row-reverse">
            <div class="max-w-none lg:flex-none max-w-md">
                ${ProfileView(username, account, session)}
            </div>
            <div class="lg:flex-auto">
                ${marketplaceHtml}
            </div>
        </div>
        ${FooterView()}`)
        return
})

app.get('/leaderboard', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    const headerHtml = HeaderView(session, req.session.username)
    const leaderboardHtml = LeaderboardView()
    res.send(`
        ${headerHtml}
        ${leaderboardHtml}
        ${FooterView()}
    `)
})

app.get('/explorer', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)
    
    const headerHtml = HeaderView(session, username)

    let html = req.query.type == 'item' ? AssetsView() : ActivitiesView()
    res.send(`
        ${headerHtml}
        ${html}
        ${FooterView()}
    `)
})

app.get('/mints', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    
    const headerHtml = HeaderView(session, username)
    const assetsHtml = AssetsView()
    res.send(`
        ${headerHtml}
        ${assetsHtml}
        ${FooterView()}
    `)
})

app.get('/marketplace', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    const headerHtml = HeaderView(session, username)

    const listings = market.filter(l => !l.times.sold && !l.times.expired)
    .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
    .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    const marketStatsHtml = MarketStatsView(listings)
    const marketplaceHtml = MarketplaceView(listings, marketStatsHtml, username, session, account)
    res.send(`
        ${headerHtml}
        ${marketplaceHtml}
        ${FooterView()}
    `)
})

app.get('/posts', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    const headerHtml = HeaderView(session, username)
    const postsView = PostsView(req.query.channel)
    res.send(`
        ${headerHtml}
        ${postsView}
        ${FooterView()}
    `)
})

app.get('/post', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    if (!req.query.id) {
        console.error(`invalid request`)
        res.sendStatus(400)
    }

    const post = posts.find(p => p.id == req.query.id)
    if (!post) {
        console.error(`post ${req.query.id} not found`)
        req.sendStatus(404)
    }

    const headerHtml = HeaderView(session, username)
    const postHtml = PostView(post, session, account)
    
    res.send(`
        ${headerHtml}
        ${postHtml}
        ${FooterView()}
    `)
})

app.get('/channels', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    res.send(`
        ${HeaderView(session, username)}
        ${ChannelsView()}
        ${FooterView()}
    `)
})