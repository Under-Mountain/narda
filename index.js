import { onMinuteAsync } from './service/service.js'
import { accounts, assets, world, market, current } from './service/model.js'
import { app } from './service/api.js'
import { PostsView, PostView, TagsView } from './views/press.js'
import { MarketStatsView } from './views/market.js'
import { HeaderView } from './views/header.js'
import { AuthView, LeaderboardView } from './views/accounts.js'
import { FooterView } from './views/footer.js'

console.log(`starting worldcore service..`)
const port = 3000
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

setInterval(await onMinuteAsync, world.interval.minute)

app.get('/', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    let listings = market.filter(l => !l.times.sold && !l.times.expired)
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    const marketStatsHtml = MarketStatsView(listings)
    const headerHtml = HeaderView(session, username)

    if (!req.session.username && !req.query.user) {
        const leaderboardHtml = LeaderboardView()
        const blogHtml = PostsView()

        res.send(`
        ${headerHtml}
        ${AuthView}
        ${marketStatsHtml}
        ${leaderboardHtml}
        ${blogHtml}
        
        ${FooterView}`)
        return
    }

    /**
     * Authenticated View
     */
    const items = assets.filter(a => a.owner == account.id && a.amount > 0)
        .sort((a, b) => { return a.properties && b.properties &&
            (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ?
            1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})

    const userActiveBankstones = items.filter((a) => a.type=="bankstone" && a.amount > 0)
    const activeEffectsTotal = current.effects.pending.length+current.effects.completed.length+current.effects.rejected.length

    const userWaters = assets.filter((a) => a.type=="water" && a.owner == account.id)
    const userWaterTotal = userWaters.reduce((sum, c) => {return sum + c.amount}, 0)

    const userMinerals = assets.filter((a) => a.type=="mineral" && a.owner == account.id)
    const userMineralTotal = userMinerals.reduce((sum, c) => {return sum + c.amount}, 0)

    const sendCreditHtml = BalanceView(account)

    let inventoryHtml = InventoryView(username, items, userMineralTotal, userWaterTotal, account)


    listings = market.filter(l => !l.times.sold && !l.times.expired)
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    if (session.username != username) listings = listings.filter(l => l.owner == username)
    const marketplaceHtml = MarketplaceView(listings, marketStatsHtml, username, session, account)

    res.send(`${headerHtml}
        ${ProfileView(username, account, userWaterTotal, userMineralTotal, userActiveBankstones, activeEffectsTotal)}

        ${session && session.username == username ? sendCreditHtml : ``}
        ${session && session.username == username ? inventoryHtml : ``}

        ${marketplaceHtml}
        ${FooterView}`)
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
        <h1>Leaderboard</h1>
        ${leaderboardHtml}
    `)
})

app.get('/transactions', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)
    
    const headerHtml = HeaderView(session, username)
    const transactionsHtml = getActivitiesHtml()
    res.send(`
        ${headerHtml}
        <h1>All Activities</h1>
        ${transactionsHtml}
    `)
})

app.get('/mints', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    
    const headerHtml = HeaderView(session, username)
    const assetsHtml = getAssetsHtml()
    res.send(`
        ${headerHtml}
        <h1>All Assets</h1>
        ${assetsHtml}
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

    const marketStatsHtml = getMarketStatsHtml(listings)
    const marketplaceHtml = getMarketplaceHtml(listings, marketStatsHtml, username, session, account)
    res.send(`
        ${headerHtml}
        <h1>Marketplace</h1>
        ${marketplaceHtml}
    `)
})

app.get('/blog', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    const headerHtml = HeaderView(session, username)
    const postsView = PostsView(req.query.tag)
    res.send(`
        ${headerHtml}
        <h1>All Posts</h1>
        ${postsView}
    `)
})

app.get('/tags', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    const headerHtml = HeaderView(session, username)
    const tagsHtml = TagsView()
    res.send(`
        ${headerHtml}
        <h1>All Tags</h1>
        ${tagsHtml}
    `)
})

app.get('/blog/post', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    const headerHtml = HeaderView(session, username)
    const postHtml = PostView()
    
    res.send(`
        ${headerHtml}
        <h1>Blog</h1>
        ${postHtml}
    `)
})