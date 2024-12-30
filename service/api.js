import * as util from './utility.js'
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import { accounts, activities, assets, market, current, world, auth, posts } from './model.js'
import * as bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'

export const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(session({
    secret: 'afdawdf@#%@#$%fadfn2&@#%4n2n%4*fadf',
    resave: false,
    saveUninitialized: false
}))

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.urlencoded({ extended: true }))

app.get('/api/accounts/:id', (req, res) => {
    const data = {
        title: 'Profile'
    }

    res.render('account', data)
})

app.get('/login', (req, res) => {
    const data = {
        title: 'Profile'
    }

    res.render('login', data)
})

app.get('/overview', (req, res) => {
    const data = {
        title: 'Profile'
    }

    res.render('index', data)
})

app.post('/api/auth', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;

	if (username && password) {
        const user = auth.find(a => a.username == username)
        if (!user) res.sendStatus(401)

        bcrypt.compare(password, user.password, (err, result) => {
            if (result && auth.findIndex(a => a.username == username && a.password == password > 0)) {
                req.session.username = username;
                res.redirect(`/?user=${req.session.username}`);
            } else {
                res.sendStatus(401)
            }
        })
	} else {
        res.sendStatus(400)
    }
});

app.get('/api/auths', function(req, res) {
    res.json(auth)
})

app.get('/api/exit', function(req, res) {
    req.session.destroy((err) => {
        if (err) console.warn(err)
        res.redirect('/')
    })
})

app.get('/api/accounts', (req, res) => {
    res.json(accounts)
})

app.get('/api/activities', (req, res) => {
    let filteredActivities = activities
    if (req.query.type) {
        filteredActivities = activities.filter(a => a.type == req.query.type)
    }

    if (req.query.user) {
        filteredActivities = activities.filter(a => a.from == req.query.user || a.to == req.query.user)
    }

    res.json(filteredActivities)
})

app.get('/api/assets', (req, res) => {
    let filteredAssets = assets
    if (req.query.user) {
        filteredAssets = assets.filter(a => a.owner == req.query.user)
    }

    res.json(filteredAssets)
})

app.get('/api/world', (req, res) => {
    res.json(world)
})

app.get('/api/current', (req, res) => {
    let account
    let inventory
    if (req.session && req.session.username) {
        account = accounts.find(a => a.id == req.session.username)
        if (!account) {
            console.error(`invalid session user ${req.session.username}`)
            res.sendStatus(403)
        }

        inventory = assets.filter(a => a.owner == req.session.username)
    }

    setTimeout(() => res.json({
        global: current,
        account: account,
        inventory: inventory
    }), world.interval.minute)
    return
})

app.get('/api/market', (req, res) => {
    let filteredListing = market
    if (req.query.user) {
        filteredListing = market.filter(a => a.owner == req.query.user)
    }

    res.json(filteredListing)
})

app.post('/api/transaction', (req, res) => {
    if (!req.session || !req.session.username) {
        res.sendStatus(401)
        return
    }

    if (!req.body.of || !req.body.to || !req.body.amount) {
        res.sendStatus(400)
        return
    }

    const id = `TX${activities.length}`
    console.log(`${id}: sending ${req.body.of}...`);

    const activity = {
        type: "transaction",
        id: id,
        of: "credit",
        from: req.session.username,
        to: req.body.to,
        amount: Number(req.body.amount),
        note: ``,
        times: {
            created: current.time
        }
    }

    activities.push(activity)
    current.activities.pending.push(activity.id)

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(activity),
        world.interval.minute)
})

app.post('/api/mint', (req, res) => {
    const id = `MNT${activities.length}`
    console.log(`${id}: minting ${req.body.type}...`);

    const to = req.body.type == "account" ? req.body.username.toLowerCase() : req.session.username
    const account = accounts.find(a => a.id == to)
    const userWaters = assets.filter(a => a.owner == to && a.type == "water")
    const userMinerals = assets.filter(a => a.owner == to && a.type == "mineral")

    const waterCost = Math.ceil(Math.pow(current.resources.water.balance / current.resources.mineral.balance, 7))
    const mineralCost = 200

    const activity = {
        "type": "mint",
        "id": id,
        "of": req.body.type,
        "from": "world",
        "to": to,
        "amount": 1,
        "note": `Minting of ${req.body.type} for ${to}`,
        "times": {
            "created": current.time
        }
    }

    const consumptions = []
    switch (req.body.type) {
        case "account":
            if (account) {
                console.warn(`account ${account.id} already exists`)
                res.sendStatus(403)
                return
            }

            if (!req.body.invitation || req.body.invitation != '1892') {
                console.warn(`invalid invitation code ${req.body.invitation}`)
                res.sendStatus(403)
                return
            }

            activities.push(activity)
            bcrypt.hash(req.body.password, 2, (err, hash) => {
                if (err) {
                    throw err
                }
                
                auth.push({
                    username: to,
                    password: hash
                })
    
                console.log(`${id}: granting access to ${to}...`);
                req.session.username = to
            })
            break
        case "bankstone":
            if (account.credits.balance < 200 ||
                userWaters.reduce((sum, c) => sum + c.amount, 0) < waterCost ||
                userMinerals.reduce((sum, c) => sum + c.amount, 0) < mineralCost) {
                console.error(`not enough balance to consume ${account.id}'s \
                    credit ${account.credits.balance}, \
                    water ${userWaters.reduce((sum, c) => sum + c.amount, 0)}, \
                    mineral ${userMinerals.reduce((sum, c) => sum + c.amount, 0)}`)

                res.sendStatus(403)
                return
            }

            activities.push(activity)
            const creditConsumption = {
                "type": "consume",
                "id": `CNS${activities.length}`,
                "of": "credits",
                "from": to,
                "to": "world",
                "amount": 200,
                "note": `Consuming minting ${id} cost of ${200.00} credit`,
                "times": {
                    "created": current.time
                }
            }
        
            activities.push(creditConsumption)
            const waterConsumption = {
                "type": "consume",
                "id": `CNS${activities.length}`,
                "of": 'water',
                "from": to,
                "to": "world",
                "amount": waterCost,
                "note": `Consuming minting ${id} cost of ${waterCost} water`,
                "times": {
                    "created": current.time
                }
            }
            
            activities.push(waterConsumption)
        
            const mineralConsumption = {
                "type": "consume",
                "id": `CNS${activities.length}`,
                "of": "mineral",
                "from": to,
                "to": "world",
                "amount": mineralCost,
                "note": `Consuming minting ${id} cost of ${1} resource`,
                "times": {
                    "created": current.time
                }
            }
        
            activities.push(mineralConsumption)

            consumptions.push(... [creditConsumption, mineralConsumption, waterConsumption])
            current.activities.pending.push(... [creditConsumption.id, mineralConsumption.id, waterConsumption.id])
            break
        default:
            break
    }

    current.activities.pending.push(activity.id)

    setTimeout(() => req.query.return ?
        res.redirect(`/?user=${req.session.username}`) : res.json([activity,... consumptions]),
        world.interval.minute)
})

app.post('/api/collect', (req, res) => {
    if (!req.session || !req.session.username) {
        res.sendStatus(401)
        return
    }

    if (!req.body.resource) {
        res.sendStatus(400)
        return
    }

    const collector = req.session.username
    const id = `CLT${activities.length}`
    console.log(`${id}: collecting ${req.body.resource}...`);

    let amount = 0
    switch (req.body.resource) {
        case "water":
            amount = util.getRandomNumber(0, 100)
            if (world.resources.water.balance - amount < 0) {
                console.log(`not enough water to collect`)
                res.sendStatus(403)
                return
            }
            break
        case "mineral":
            amount = util.getRandomNumber(0, 20)
            if (world.resources.water.balance - amount < 0) {
                console.log(`not enough mineral to collect`)
                res.sendStatus(403)
                return
            }
            break
        default:
            break
    }

    const activity = {
        "type": "collect",
        "id": id,
        "of": req.body.resource,
        "from": "world",
        "to": collector,
        "amount": amount,
        "note": `Collecting of ${req.body.resource} for ${collector}`,
        "times": {
            "created": current.time
        }
    }

    activities.push(activity)
    current.activities.pending.push(activity.id)

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(activity),
        world.interval.minute)
})

app.post('/api/list', (req, res) => {
    if (!req.session || !req.session.username) {
        res.sendStatus(401)
        return
    }

    if (!req.body.id || !req.body.price) {
        res.sendStatus(400)
        return
    }

    const id = `LST${market.length}`
    console.log(`${id}: listing ${req.body.id} for sale...`)

    const listing = {
        id: id,
        item: req.body.id,
        price: Number(req.body.price),
        owner: req.session.username,
        amount: Number(req.body.amount),
        times: {
            created: current.time,
            lastUpdated: current.time
        }
    }

    const item = assets.find(a => a.id == listing.item)
    item.amount -= listing.amount
    market.push(listing)

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(listing),
        world.interval.minute)
})

app.post('/api/edit', (req, res) => {
    if (!req.session.username) {
        res.sendStatus(401)
        return
    }
    if (!req.body.bio) {
        res.sendStatus(400)
        return
    }

    const account = accounts.find(a => a.id == req.session.username)
    if (account.credits.balance < 100) {
        console.warn(`not enough balance to edit`)
        res.sendStatus(403)
    }

    const creditConsumption = {
        "type": "consume",
        "id": `CNS${activities.length}`,
        "of": "credits",
        "from": req.session.username,
        "to": "world",
        "amount": 100,
        "note": `Consuming -100 credit for edit bio`,
        "times": {
            "created": current.time
        }
    }

    activities.push(creditConsumption)
    current.activities.pending.push(creditConsumption.id)

    console.log(`${req.session.username}: editing bio...`)
    account.bio = req.body.bio
    account.times.edited = current.time

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(account),
        world.interval.minute)
})

app.post('/api/comment', (req, res) => {
    if (!req.session.username) {
        res.sendStatus(401)
        return
    }
    if (!req.body.postId || !req.body.comment) {
        console.warn(`post ID ${req.body.postId} or comment ${req.body.comment} not found`)
        res.sendStatus(400)
        return
    }

    const account = accounts.find(a => a.id == req.session.username)
    if (account.credits.balance < 5) {
        console.warn(`not enough balance to comment`)
        res.sendStatus(403)
        return
    }

    const post = posts.find(p => p.id == req.body.postId)
    if (!post) {
        console.warn(`post ID ${req.body.postId} not found`)
        res.sendStatus(400)
        return
    }

    const creditConsumption = {
        "type": "consume",
        "id": `CNS${activities.length}`,
        "of": "credits",
        "from": req.session.username,
        "to": "world",
        "amount": 5,
        "note": `Consuming -5 credit to comment`,
        "times": {
            "created": current.time
        }
    }

    activities.push(creditConsumption)
    current.activities.pending.push(creditConsumption.id)

    console.log(`${req.session.username}: creating a comment...`)
    post.comments.push({
        comment:req.body.comment,
        author: account.id,
        time: current.time,
        likes: 0,
        dislikes: 0
    })

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(post),
        world.interval.minute)
})

app.post('/api/like', (req, res) => {
    if (!req.session.username) {
        res.sendStatus(401)
        return
    }
    if (!req.body.postId) {
        console.warn(`post ID ${req.body.postId} or comment ${req.body.comment} not found`)
        res.sendStatus(400)
        return
    }

    const account = accounts.find(a => a.id == req.session.username)
    if (account.credits.balance < 1) {
        console.warn(`not enough balance to comment`)
        res.sendStatus(403)
        return
    }

    const post = posts.find(p => p.id == req.body.postId)
    if (!post) {
        console.warn(`post ID ${req.body.postId} not found`)
        res.sendStatus(400)
        return
    }

    const dislike = req.body.dislike? true: false

    const creditConsumption = {
        "type": "consume",
        "id": `CNS${activities.length}`,
        "of": "credits",
        "from": req.session.username,
        "to": "world",
        "amount": 1,
        "note": `Consuming -1.00 credit to ${dislike ? 'dislike': 'like'}`,
        "times": {
            "created": current.time
        }
    }

    activities.push(creditConsumption)
    current.activities.pending.push(creditConsumption.id)

    console.log(`${req.session.username}: creating a ${dislike ? 'dislike' : 'like'}`)
    if (dislike) post.dislikes += 1
    else post.likes += 1

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(post),
        world.interval.minute)
})

app.post('/api/post', (req, res) => {
    if (!req.session.username) {
        res.sendStatus(401)
        return
    }
    if (!req.body.title && !req.body.content) {
        res.sendStatus(400)
        return
    }

    const account = accounts.find(a => a.id == req.session.username)
    if (account.credits.balance < 10) {
        console.warn(`not enough balance to post`)
        res.sendStatus(403)
        return
    }

    const creditConsumption = {
        "type": "consume",
        "id": `CNS${activities.length}`,
        "of": "credits",
        "from": req.session.username,
        "to": "world",
        "amount": 10,
        "note": `Consuming -10 credit to post`,
        "times": {
            "created": current.time
        }
    }

    activities.push(creditConsumption)
    current.activities.pending.push(creditConsumption.id)

    console.log(`${req.session.username}: creating a post...`)
    const post = {
        id: `PST${posts.length}`,
        author: req.session.username,
        title: req.body.title,
        content: req.body.content,
        channels: req.body.channels.replace(/\s+/g, '').split(','),
        likes: 0,
        dislikes: 0,
        times: {
            created: current.time
        },
        comments: []
    }

    posts.push(post)

    setTimeout(() => req.query.return ?
        res.redirect(req.query.return) : res.json(post),
        world.interval.minute)
})

app.post('/api/trade', (req, res) => {
    if (!req.session.username) {
        res.sendStatus(401)
        return
    }
    if (!req.body.id) {
        res.sendStatus(400)
        return
    }

    const listing = market.find(l => l.id == req.body.id)
    const item = assets.find(a => a.id == listing.item)

    if (req.session.username == item.owner) {
        // delist and restore amount
        item.amount += listing.amount
        listing.times.expired = current.time

        setTimeout(() => req.query.return ?
            res.redirect(req.query.return) : res.json([item, listing]),
            world.interval.minute)
    } else {
        console.log(`TX${activities.length}: buying ${item.id} at ${listing.price}...`);

        const creditTx = {
            type: "transaction",
            id: `TX${activities.length}`,
            of: "credit",
            from: req.session.username,
            to: item.owner,
            amount: listing.price,
            note: `Purchase of ${item.id} at ${listing.price} credit`,
            times: {
                created: current.time
            }
        }

        activities.push(creditTx)
    
        const itemTx = {
            type: "transaction",
            id: `TX${activities.length}`,
            of: item.id,
            from: item.owner,
            to: req.session.username,
            amount: listing.amount,
            note: `Sale of ${item.id} at ${listing.price} credit`,
            times: {
                created: current.time
            }
        }

        activities.push(itemTx)

        current.activities.pending.push(creditTx.id)
        current.activities.pending.push(itemTx.id)
        listing.times.sold = current.time

        setTimeout(() => req.query.return ?
            res.redirect(req.query.return) : res.json([creditTx, itemTx]),
            world.interval.minute)
    }
})