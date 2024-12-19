import { onMinuteAsync } from './service/service.js'
import { accounts, activities, assets, world, market, current, auth, blog } from './service/model.js'
import { app } from './service/api.js'
import * as util from './service/utility.js'

console.log(`starting worldcore service..`)
const port = 3000
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

setInterval(await onMinuteAsync, world.interval.minute)

app.get('/leaderboard', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    const headerHtml = getHeaderHtml(session, req.session.username)
    const leaderboardHtml = getLeaderboardHtml()
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
    
    const headerHtml = getHeaderHtml(session, username)
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
    
    const headerHtml = getHeaderHtml(session, username)
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

    const headerHtml = getHeaderHtml(session, username)

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

    const headerHtml = getHeaderHtml(session, username)
    const blogHtml = getBlogHtml(req.query.tag)
    res.send(`
        ${headerHtml}
        <h1>All Posts</h1>
        ${blogHtml}
    `)
})

app.get('/tags', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username

    const headerHtml = getHeaderHtml(session, username)
    const tagsHtml = getTagsHtml()
    res.send(`
        ${headerHtml}
        <h1>All Tags</h1>
        ${tagsHtml}
    `)
})

app.get('/blog/post', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)
    const post = blog.find(p => p.id == req.query.id)

    let commentsHtml = `<p style="text-align:center">No comments left yet</p>`
    if (post.comments.length > 0) {
        commentsHtml = `<ul>`
        post.comments.forEach(c => {
            commentsHtml += `<li>
            <p>${c.comment}</p>
            <small>left by ${c.author} on ${getTimeHtml(c.time)}</small></li>
            `
        })
        commentsHtml += "</ul>"
    }

    const headerHtml = getHeaderHtml(session, username)
    const postHtml = `
        ${post? `
        <h1>${post.title}</h1>
        <small>
            ${post.tags ? `Tags: <span style="color:gray">${post.tags.map(t => {
                return `<a href="/blog?tag=${t}">#${t}</a>`}).join(", ")}</span>` : ''}
                posted on ${getTimeHtml(post.times.created)} by ${post.author}
        </small>
        <p>${post.content}</p>
        <div><small>
            <form action="/like?return=/blog/post?id=${post.id}" method="post">
                <input type="hidden" name="postId" value="${post.id}" />
                <button ${!session.username || (session.username && account.credits.balance < 1) ? `disabled` :``}>
                    ${post.likes} Like (-1.00 credit)</button>
                <button name="dislike" value="true" ${!session.username || (session.username && account.credits.balance < 1) ? `disabled` :``}>
                    ${post.dislikes} Dislike (-1.00 credit)</button>
            </form>
        </small></div>
        <div>
            <form action="/comment?return=/blog/post?id=${post.id}" method="post" style="text-align:right">
                <textarea style="margin-bottom:.3em" name="comment" rows="4" cols="60" placeholder="Leave your comment"></textarea>
                <div>
                    <button name="postId" value="${post.id}"
                        ${!session.username || (session.username && account.credits.balance < 5) ? `disabled` :``}>Comment (-5.00 credit)</button></div>
            </form>
            <h3 style="text-align:right"><small>${post.comments.length}</small> comments</h3>
            ${commentsHtml}
        </div>

        ` : `<h3>Post id ${id} not found</h3>`}`
    
    res.send(`
        ${headerHtml}
        <h1>Blog</h1>
        ${postHtml}
    `)
})

app.get('/', (req, res) => {
    const session = req.session
    const username = req.query.user? req.query.user : req.session.username
    const account = accounts.find(a => a.id == username)

    let listings = market.filter(l => !l.times.sold && !l.times.expired)
    .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
    .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    const marketStatsHtml = getMarketStatsHtml(listings)
    const headerHtml = getHeaderHtml(session, username)

    if (!req.session.username || !req.query.user) {
        const leaderboardHtml = getLeaderboardHtml()
        const blogHtml = getBlogHtml()

        res.send(`<html><body>
            ${headerHtml}
            <h2>Worldbank of Web3 Economy <small>(in active development)</small></h2>
            <h3>Collect resources from the new world. Craft and trade items! Receive Web3 credits before token launch!</h3>

            ${!session.username? `<form action="/auth" method="post">
                <h3 style="margin-bottom:1px">Login</h3>
                <div><small>
                    <input name="save" type="checkbox" />
                    <label for="save">Keep the access for next 7 days</label>
                </small></div>
                <div>
                    <input name="username" placeholder="username" required />
                    <input name="password" type="password" placeholder="password" required />
                    <button>Enter</button>
                </div>
            </form>

            <form action="/mint" method="post">
                <h3 style="margin-bottom:1px">Register</h3>
                <small>Invitation code is required at this time. Please check out <a href="https://github.com" target="_blank">project site</a> for more details.</small>
                <div>
                    <input name="invitation" placeholder="invitation code" required />
                    <input name="username" placeholder="username" style="text-transform:lowercase" type="text" pattern="[a-z0-9]+" required />
                </div>
                <div>
                    <input name="password" type="password" placeholder="password" required />
                    <input name="confirm" type="password" placeholder="confirm" required />
                    <button name="type" value="account">Mint Account</button>
                </div>
            </form>`:``}

            <h2>Market Statistics</h2>
            ${marketStatsHtml}

            <h2>Leaderboard</h2>
            <div>
                <h4>Balance</h4>
                ${leaderboardHtml}
            </div>

            <h2>Blog</h2>
            <div>
                ${blogHtml}
            </div>
        </body></html>`)
        return
    }

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

    const sendCreditHtml = `
        <form action="/transaction?return=/?user=${username}" method="post" style="text-align:right">
            <div style="margin-top:1em">
                <input type="hidden" name="from" value="${username}" />
                <input name="to" placeholder="receiver's username" required />
                <input name="amount" type="number" min=".01" max="1000.00" value=".01" step=".01" required />
                <button name="of" value="credit" ${(session.username && account.credits.balance < .01) ? `disabled` :``}>Send</button>
            </div>
        </form>
        <form action="/post?return=/" method="post" style="text-align:right">
            <div>
                <label for="title">Title</label>
                <input name="title" placeholder="Title is required to post" required />
                <label for="tags">Tags</label>
                <input name="tags" placeholder="general, question, issue, ..." />
            </div>
            <textarea style="margin-bottom:.3em" name="content" rows="4" cols="60" placeholder="Each credit consumption on the post will be fully rewarded to content creator."></textarea>
            <div><button ${(session.username && account.credits.balance < 10) ? `disabled` :``}>Post (-10.00 credit)</button></div>
        </form>
    `

    let inventoryHtml = `<h3>Inventory (<a href="/assets?user=${username}">${items.filter(i => i.owner == username).length}</a>)</h3>`
    if (items.length > 0) {
        inventoryHtml += `
            <form action="/mint?return=/?user=${username}" method="post">
                <div>
                    <input type="hidden" name="owner" value="${username}" />
                    
                    <button name="type" value="bankstone"
                        ${userMineralTotal < 100 ||
                        userWaterTotal < Math.ceil(current.resources.water.supplied/current.resources.mineral.supplied) ||
                        account.credits.balance < 200 ? "disabled": ""}>
                        Mint Bankstone (-200.00 credit)
                    </button>
                    <small for="type">
                        consumes
                        ${Math.ceil(current.resources.water.supplied*Math.log(accounts.length*accounts.length)/current.resources.mineral.supplied)}
                        water +
                        ${100} mineral
                </div>
            </form>
        <ul>`
        items.slice(0, 20).forEach(i => {
            inventoryHtml += `<li>
                <form action="/list?return=/?user=${username}" method="post">
                    <div>
                        ${i.amount} unit(s) of ${i.owner}'s ${i.type} ${i.type=="bankstone" ? ` <small>APR ${(i.properties.yield*100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked/i.properties.cap * 100).toFixed(0)}%)</small>` : ``}
                        <small for="id">${i.id}</small>
                        <input name="id" type="hidden" value="${i.id}" />
                    </div>
                    <div>
                        <button name="owner" value="${username}" 
                            ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "disabled" : ""}>
                            ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "Sell (min.100)" : `Sell ${i.amount}`}
                        </button>
                        <input name="amount" type="hidden" value="${i.amount}" />
                        for <input name="price" type="number" value="${i.type == "bankstone" ?
                            (i.properties.staked * i.properties.yield * .33).toFixed(2) :
                            (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2)}" max="1000.00" step=".01" />
                        <small>credit</small>
                    </div>
                </form>
            </li>`
        })
        inventoryHtml += "</ul>"
    } else inventoryHtml += "<p>Empty. Collect resources or buy items from Marketplace<p>"


    listings = market.filter(l => !l.times.sold && !l.times.expired)
    .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
    .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    if (session.username != username) listings = listings.filter(l => l.owner == username)
    const marketplaceHtml = getMarketplaceHtml(listings, marketStatsHtml, username, session, account)

    res.send(`<html><body>
        ${headerHtml}
        <h2 style="text-align:center;margin-bottom:.3em">${username}</h2>

        <div style="text-align:center">${session.username && session.username == username ? `
            <form action="/edit?return=/" method="post">
                <textarea name="bio" rows="3" cols="50" placeholder="Write description of this account.">${account.bio? account.bio:''}</textarea>
                <div style="margin-top:.3em"><button ${(session.username && account.credits.balance < 100) ? `disabled` :``}>Update Bio (-100.00 credit)</button></div>
            </form>
        `: `<p style="text-align:center">${account.bio? account.bio : `No description`}</p>`}
        </div>

        <div style="text-align:right"><small style="color:gray;margin-bottom:0">balance</small></div>
        <div style="text-align:right">
            <small style="color:${"#00A0FF"}"><strong>water</strong></small> ${userWaterTotal}<small style="color:${"#BBB"}">/${current.resources.water.supplied.toFixed(0)}(${(userWaterTotal/current.resources.water.supplied*100).toFixed(2)}%)</small>

            <small style="color:${"#FF03EA"}"><strong>mineral</strong></small> ${userMineralTotal}<small style="color:${"#BBB"}">/${current.resources.mineral.supplied.toFixed(0)}(${(userMineralTotal/current.resources.mineral.supplied*100).toFixed(2)}%)</small>
            <small style="color:${"gray"}"><strong>bankstones</strong></small> ${userActiveBankstones.length}<small style="color:${"#BBB"}">/${activeEffectsTotal}(${(userActiveBankstones.length/activeEffectsTotal*100).toFixed(2)}%)</small>
        </div>
        <div style="text-align:right">
            <h1 style="margin-top:.3em;margin-bottom:1px">
                ${account.credits.balance.toFixed(2)} <small style="color:gray"><small>credit</small></small>
            </h1>
            <small>
                holding ${(account.credits.balance/current.resources.credits.balance*100).toFixed(2)}% of
                ${current.resources.credits.balance.toFixed(2)} credits circulating..
            </small>
        </div>

        ${session && session.username == username ? sendCreditHtml : ``}
        ${session && session.username == username ? inventoryHtml : ``}

        ${marketplaceHtml}
        </body></html>`)
})

function getMarketStatsHtml(listings) {
    const marketSoldStats = util.getStats(market.filter(l => l.times.sold).map(l => l.price))
    const activeListingStats = util.getStats(listings.map(l => l.price))

    const marketStatsHtml = `
        <div>
            <small>total ${activeListingStats.count} (${activeListingStats.sum.toFixed(0)} credit) selling at
            avg. ${activeListingStats.mean.toFixed(2)}
            mdn. ${activeListingStats.median.toFixed(2)}
            </small>
        </div>
        <div>
            <small>total ${marketSoldStats.count} (${marketSoldStats.sum.toFixed(2)} credit) sold at
            avg. ${marketSoldStats.mean.toFixed(2)}
            mdn. ${marketSoldStats.median.toFixed(2)}
            </small>
        </div>
    `
    return marketStatsHtml
}

function getMarketplaceHtml(listings, marketStatsHtml, username, session, account) {
    let marketplaceHtml = `<h3 style="margin-bottom:0">Marketplace (<a href="/market?expired=false&sold=false">${listings.length}</a>)</h3>`
    if (listings.length > 0) {
        marketplaceHtml += `${marketStatsHtml}
        <ul>`
        listings.slice(0, 20).forEach(l => {
            const i = assets.find(a => a.id == l.item)
            marketplaceHtml += `<li>
                <form action="/trade?return=/?user=${username}" method="post">
                    <div>
                        ${l.amount}
                        unit of ${l.owner}'s ${i.type} ${i.type == "bankstone" ? ` <small>APR ${(i.properties.yield * 100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked / i.properties.cap * 100).toFixed(0)}%)</small>` : ``}
                        <small for="id">${l.id}</small>
                        <input name="id" type="hidden" value="${l.id}" />
                    </div>
                    <div>
                        <button name="buyer" value="${username}" ${!session.username || (session.username != username && account.credits.balance < l.price) ? `disabled` : ``}>
                            ${session.username && l.owner == username ? 'Delist' : 'Buy'}</button>
                        for <input name="price" type="number" value="${l.price.toFixed(2)}" readonly />
                        <small>credit (${(l.price / l.amount).toFixed(2)}/unit)</small>
                    </div>
                </form>
            </li>`
        })
        marketplaceHtml += "</ul>"
    } else marketplaceHtml += `<p style="text-align:center">Nothing listed for sale at this time<p>`
    return marketplaceHtml
}

function getLeaderboardHtml() {
    const balanceLeaders = accounts.sort((a, b) => { return a.credits.balance > b.credits.balance ? -1 : 1 })
    let balanceLeaderHtml = "<p>Empty<p>"
    if (balanceLeaders.length > 0) {
        balanceLeaderHtml = "<ul>"
        balanceLeaders.slice(0, 100).forEach((a, idx) => {
            balanceLeaderHtml += `<oi><div>
                    <strong>${idx + 1}.</strong>
                    <strong><a href="/?user=${a.id}">${a.id}</a></strong>
                    <small>(balance: ${a.credits.balance.toFixed(2)})</small>
                </div></oi>`
        })
        balanceLeaderHtml += "</ul>"
    }
    return balanceLeaderHtml
}

function getActivitiesHtml() {
    const filtered = activities
        //.filter(a => a.type == "transaction")
        .sort((a, b) => { return a.times.completed > b.times.completed ? -1 : 1 })
    
    let activitieisHtml = `<p style="text-align:center">Empty<p>`
    if (filtered.length > 0) {
        activitieisHtml = `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 1000).forEach((t, idx) => {
            activitieisHtml += `<oi><div><small>
                    ${t.id}: Transaction of
                    <strong>${t.amount.toFixed(2)}</strong>
                    <strong>${t.of}</strong>
                    from <strong>${t.from}</strong>
                    to <strong>${t.to}</strong>
                    on ${getTimeHtml(t.times.completed)}
                    <strong>note:</strong> ${t.note}
                </small></div></oi>`
        })
        activitieisHtml += "</ul>"
    }
    return activitieisHtml
}

function getAssetsHtml() {
    const filtered = assets
        .sort((a, b) => { return a.properties && b.properties &&
            (a.properties.staked * a.properties.yield) > (b.properties.staked * b.properties.yield) ?
            1 : -1})
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1})
    
    let assetsHtml = `<p style="text-align:center">Empty<p>`
    if (filtered.length > 0) {
        assetsHtml = `<ul style="font-weight:normal;padding:.3em">`
        filtered.slice(0, 1000).forEach((a, idx) => {
            assetsHtml += `<oi><div><small>
                    ${a.id}: <strong>${a.amount}</strong> units of
                    <strong>${a.type}</strong>
                    owned by <strong>${a.owner}</strong>
                </small></div></oi>`
        })
        assetsHtml += "</ul>"
    }
    return assetsHtml
}

function getBlogHtml(tag) {
    const posts = blog.filter(p => !tag ? true : p.tags.indexOf(tag) >= 0).sort((a, b) => { return a.times.created > b.times.created ? -1 : 1 })
    let blogHtml = ``
    if (blog.length > 0) {
        blogHtml = `<ul style="padding:.3em">`
        posts.slice(0, 100).forEach((p, idx) => {
            blogHtml += `<oi><div>
                    <h3 style="margin-bottom:.1em">
                        <a href="/blog/post?id=${p.id}">${p.title}</a>
                    </h3>
                    <small>${p.tags ? `Tags: <span style="color:gray">${p.tags.map(t => {
                            return `<a href="/blog?tag=${t}">#${t}</a>`
                        }).join(", ")}</span> ` : ''}posted on ${getTimeHtml(p.times.created)} by ${p.author}</small>
                    <p>${p.content}</p>
                    <small>${p.likes} likes</small>
                    <small>${p.dislikes} dislikes</small>
                    <small>${p.comments.length} comments</small>
                </div></oi>`
        })
        blogHtml += "</ul>"
    } else { `<p>Empty</p>`} 
    return blogHtml
}

function getTagsHtml(tag) {
    const allTags = []
    blog.forEach(p => {
        p.tags.forEach(t => {
            if (allTags.indexOf(t) < 0) allTags.push(t)
        })
    })

    let tagsHtml = ``
    if (allTags.length > 0) {
        tagsHtml = `<div>`
        allTags.slice(0, 1000).forEach((tag, idx) => {
            tagsHtml += `<span style="padding:.1em;background-color:#EEE"><a href="/blog?tag=${tag}">#${tag}</a></span>`
        })
        tagsHtml += "</div>"
    } else { `<p>Empty</p>`} 
    return tagsHtml
}

function getTimeHtml(time) {
    return `
        Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}
        Day ${Math.floor(time / (world.interval.hour * world.interval.day))}
        ${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}</a>
    `
}

function getHeaderHtml(session, username) {
    const allTags = []
    blog.forEach(p => {
        p.tags.forEach(t => {
            if (allTags.indexOf(t) < 0) allTags.push(t)
        })
    })

    return `
        <div style="background-color:black;color:white;padding:.5em;"><small>
            📢 Interested in joining this open project?
            <a href="https://github.com" target="_blank">learn more</a>
        </small></div>
        
        <div style="display:flex;justify-content:space-between">
            <div>
                <h1 style="font-size:1.5em;margin-top:.3em;margin-bottom:0px;"><small><a href="/">Bankstone</a></small></h1>
                <small>Web3 Currency & Digital Asset Platform</small>
            </div>
            <div style="padding:.3em;text-align:right;margin-top:auto"><small>
                <a href="/blog">Blog(${blog.length})</a>
                <a href="/tags">Tags(${allTags.length})</a>
                <a href="/leaderboard">Leaderboard(${accounts.length})</a>
                <a href="/blog">Blog(${blog.length})</a>
                <a href="/marketplace">Marketplace(${market.length})</a>
                <a href="/mints">Items(${assets.length})</a>
                <a href="/transactions">Transactions(${activities.length})</a>
            </small></div>
        </div>
        <div style="display:flex;justify-content:space-between;background:#EFEFEF;margin:0;padding:.5em">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1em"><circle fill="#00A0FF" stroke="#00A0FF" stroke-width="30" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                <small style="color:${"#00A0FF"}"><strong>water</strong></small>
                <span style="color:${"#000"}">${current.resources.water.balance.toFixed(0)}</span>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1em"><path fill="#FF03EA" stroke="#FF03EA" stroke-width="30" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="3.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>
                <small style="color:${"#FF03EA"}"><strong>mineral</strong></small>
                <span style="color:${"#000"}">${current.resources.mineral.balance.toFixed(0)}</span></span>

                <small style="margin-left:1em">
                    <svg width="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="FF0000" stroke="FF0000" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect x="11" y="6" rx="1" width="2" height="7"><animateTransform attributeName="transform" type="rotate" dur="15s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect><rect x="11" y="11" rx="1" width="2" height="9"><animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect></svg><small style="color:gray">x${60000 / world.interval.minute}</small>
                    Year ${Math.floor(current.time / (world.interval.hour * world.interval.day * world.interval.year))}
                    Day ${Math.floor(current.time / (world.interval.hour * world.interval.day))}
                    <a href="/current">${Math.floor(current.time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${current.time % (world.interval.hour) < 10 ? '0' : ''}${current.time % (world.interval.hour)}</a>
                    <small>(${(current.time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>
                </small>
            </div>
            <div style="margin-left:auto">
                <div>
                    ${session.username ? `<a href="/?user=${session.username}">${session.username}</strong><small>(${accounts.find(a=>a.id==session.username)?.credits.balance.toFixed(2)} credit)<small> <a href="/exit">exit</a>` : ``}
                </div>
            </div>
        </div>

        <!--
        <ul style="padding:0;text-align:right"><small>
            <li><a href="/accounts">all accounts (${accounts.length})</a></li>
            <li>
                <a href="/activities?type=transaction">transactions (${activities.filter(a => a.type == "transaction").length})</a>
                <a href="/activities?type=mint">minted (${activities.filter(a => a.type == "mint").length})</a>
                <a href="/activities?type=collect">collects (${activities.filter(a => a.type == "collect").length})</a>
                <a href="/activities">all activities (${activities.length})</a>
            </li>
            <li><a href="/assets">assets (${assets.length} minted)</a></li>
            <li><a href="/auths">auths (${auth.length})</a></li>
        </small></ul>
        -->

        ${session.username && session.username == username ? `
            <form action="/collect?return=/?user=${username}" method="post">
                <input type="hidden" name="owner" value="${username}" />
                <button name="resource" value="water" ${current.resources.water.balance <= 0 ? "disabled" : ""}>Collect water (5-10)</button>
                <button name="resource" value="mineral" ${current.resources.mineral.balance <= 0 ? "disabled" : ""}>Collect mineral (1-3)</button>
            </form>
            ` : ``}
    `
}
