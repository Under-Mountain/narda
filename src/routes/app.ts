import * as util from '../service/utility.js'
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import { accounts, activities, assets, market, current, world, auth, posts } from '../service/model.js'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'
import { ActivityType } from '../interfaces/Activity.js';
import { createActivity, consume, collect } from '../service/activity.js';

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

app.get('/api/accounts/:id', async (req, res) => {
    try {
        const data = { title: 'Profile' };
        res.render('account', data);
    } catch (error) {
        res.sendStatus(500);
    }
});

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

app.post('/api/auth', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const user = auth.find(a => a.username == username);
            if (!user) {
                res.sendStatus(401);
                return;
            }

            const result = await bcrypt.compare(password, user.password);
            if (result) {
                req.session.username = username;
                res.redirect(`/?user=${req.session.username}`);
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/auths', async (req, res) => {
    try {
        res.json(auth);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/exit', async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) console.warn(err);
            res.redirect('/');
        });
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/accounts', async (req, res) => {
    try {
        res.json(accounts);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/activities', async (req, res) => {
    try {
        let filteredActivities = activities;
        if (req.query.type) {
            filteredActivities = activities.filter(a => a.type == req.query.type);
        }
        if (req.query.user) {
            filteredActivities = activities.filter(a => a.from == req.query.user || a.to == req.query.user);
        }
        res.json(filteredActivities);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/assets', async (req, res) => {
    try {
        let filteredAssets = assets;
        if (req.query.user) {
            filteredAssets = assets.filter(a => a.owner == req.query.user);
        }
        res.json(filteredAssets);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/world', async (req, res) => {
    try {
        res.json(world);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/current', async (req, res) => {
    try {
        if (req.session && req.session.username) {
            const account = accounts.find(a => a.id == req.session.username);
            if (!account) {
                console.error(`invalid session user ${req.session.username}`);
                res.sendStatus(403);
                return;
            }
            const inventory = assets.filter(a => a.owner == req.session.username);
            setTimeout(() => res.json({ global: current, account, inventory }), world.interval.minute);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/market', async (req, res) => {
    try {
        let filteredListing = market;
        if (req.query.user) {
            filteredListing = market.filter(a => a.owner == req.query.user);
        }
        res.json(filteredListing);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/transaction', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.of || !req.body.to || !req.body.amount) {
            res.sendStatus(400);
            return;
        }
        const activity = createActivity(
            "transaction" as ActivityType,
            "credit",
            req.session.username,
            req.body.to,
            Number(req.body.amount),
            ""
        );
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(activity), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/mint', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        const id = `MNT${activities.length}`;
        console.log(`${id}: minting ${req.body.type}...`);
        const to = req.body.type == "account" ? req.body.username.toLowerCase() : req.session.username;
        const account = accounts.find(a => a.id == to);
        const userWaters = assets.filter(a => a.owner == to && a.type == "water");
        const userMinerals = assets.filter(a => a.owner == to && a.type == "mineral");
        const waterCost = Math.ceil(Math.pow(current.resources.water.balance / current.resources.mineral.balance, 7));
        const mineralCost = 200;
        const activity = createActivity(
            "mint" as ActivityType,
            req.body.type,
            "world",
            to,
            1,
            `Minting of ${req.body.type} for ${to}`
        );
        const consumptions: any[] = [];
        switch (req.body.type) {
            case "account":
                if (account) {
                    console.warn(`account ${account.id} already exists`);
                    res.sendStatus(403);
                    return;
                }
                if (!req.body.invitation || req.body.invitation != '1892') {
                    console.warn(`invalid invitation code ${req.body.invitation}`);
                    res.sendStatus(403);
                    return;
                }
                const hash = await bcrypt.hash(req.body.password, 2);
                auth.push({ username: to, password: hash });
                console.log(`${id}: granting access to ${to}...`);
                req.session.username = to;
                break;
            case "bankstone":
                if (!account) {
                    res.send(403);
                    return;
                }
                if (account.credits.balance < 200 ||
                    userWaters.reduce((sum, c) => sum + c.amount, 0) < waterCost ||
                    userMinerals.reduce((sum, c) => sum + c.amount, 0) < mineralCost) {
                    console.error(`not enough balance to consume ${account.id}'s \
                        credit ${account.credits.balance}, \
                        water ${userWaters.reduce((sum, c) => sum + c.amount, 0)}, \
                        mineral ${userMinerals.reduce((sum, c) => sum + c.amount, 0)}`);
                    res.sendStatus(403);
                    return;
                }
                const creditConsumption = consume(to, "credits", 200);
                const waterConsumption = consume(to, 'water', waterCost);
                const mineralConsumption = consume(to, "mineral", mineralCost);
                consumptions.push(... [creditConsumption, mineralConsumption, waterConsumption]);
                break;
            default:
                break;
        }
        setTimeout(() => req.query.return ? res.redirect(`/?user=${req.session.username}`) : res.json([activity, ...consumptions]), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/collect', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.resource) {
            res.sendStatus(400);
            return;
        }
        const collector = req.session.username;
        const id = `CLT${activities.length}`;
        console.log(`${id}: collecting ${req.body.resource}...`);
        let amount = 0;
        switch (req.body.resource) {
            case "water":
                amount = util.getRandomNumber(0, 100);
                if (world.resources.water.balance - amount < 0) {
                    console.log(`not enough water to collect`);
                    res.sendStatus(403);
                    return;
                }
                break;
            case "mineral":
                amount = util.getRandomNumber(0, 20);
                if (world.resources.water.balance - amount < 0) {
                    console.log(`not enough mineral to collect`);
                    res.sendStatus(403);
                    return;
                }
                break;
            default:
                break;
        }
        const activity = collect(collector, req.body.resource, amount);
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(activity), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/list', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.id || !req.body.price) {
            res.sendStatus(400);
            return;
        }
        const id = `LST${market.length}`;
        console.log(`${id}: listing ${req.body.id} for sale...`);
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
        };
        const item = assets.find(a => a.id == listing.item);
        if (!item) {
            res.send(403);
            return;
        }
        item.amount -= listing.amount;
        market.push(listing);
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(listing), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/edit', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.bio) {
            res.sendStatus(400);
            return;
        }
        const account = accounts.find(a => a.id == req.session.username);
        if (!account || account.credits.balance < 100) {
            console.warn(`not enough balance to edit`);
            res.sendStatus(403);
            return;
        }
        const creditConsumption = consume(req.session.username, "credits", 100);
        activities.push(creditConsumption);
        current.activities.pending.push(creditConsumption.id);
        console.log(`${req.session.username}: editing bio...`);
        account.bio = req.body.bio;
        account.times.edited = current.time;
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(account), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/comment', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.postId || !req.body.comment) {
            console.warn(`post ID ${req.body.postId} or comment ${req.body.comment} not found`);
            res.sendStatus(400);
            return;
        }
        const account = accounts.find(a => a.id == req.session.username);
        if (!account || account.credits.balance < 5) {
            console.warn(`not enough balance to comment`);
            res.sendStatus(403);
            return;
        }
        const post = posts.find(p => p.id == req.body.postId);
        if (!post) {
            console.warn(`post ID ${req.body.postId} not found`);
            res.sendStatus(400);
            return;
        }
        const creditConsumption = consume(req.session.username, "credits", 5);
        activities.push(creditConsumption);
        current.activities.pending.push(creditConsumption.id);
        console.log(`${req.session.username}: creating a comment...`);
        post.comments.push({
            comment: req.body.comment,
            author: account.id,
            time: current.time,
            likes: 0,
            dislikes: 0
        });
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(post), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/like', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.postId) {
            console.warn(`post ID ${req.body.postId} or comment ${req.body.comment} not found`);
            res.sendStatus(400);
            return;
        }
        const account = accounts.find(a => a.id == req.session.username);
        if (!account || account.credits.balance < 1) {
            console.warn(`not enough balance to comment`);
            res.sendStatus(403);
            return;
        }
        const post = posts.find(p => p.id == req.body.postId);
        if (!post) {
            console.warn(`post ID ${req.body.postId} not found`);
            res.sendStatus(400);
            return;
        }
        const dislike = req.body.dislike ? true : false;
        const creditConsumption = consume(req.session.username, "credits", 1);
        activities.push(creditConsumption);
        current.activities.pending.push(creditConsumption.id);
        console.log(`${req.session.username}: creating a ${dislike ? 'dislike' : 'like'}`);
        if (dislike) post.dislikes += 1;
        else post.likes += 1;
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(post), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/post', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.title && !req.body.content) {
            res.sendStatus(400);
            return;
        }
        const account = accounts.find(a => a.id == req.session.username);
        if (!account || account.credits.balance < 10) {
            console.warn(`not enough balance to post`);
            res.sendStatus(403);
            return;
        }
        const creditConsumption = consume(req.session.username, "credits", 10);
        activities.push(creditConsumption);
        current.activities.pending.push(creditConsumption.id);
        console.log(`${req.session.username}: creating a post...`);
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
        };
        posts.push(post);
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(post), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/trade', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.id) {
            res.sendStatus(400);
            return;
        }
        const listing = market.find(l => l.id == req.body.id);
        if (!listing) {
            res.sendStatus(403);
            return;
        }
        const item = assets.find(a => a.id == listing.item);
        if (!item) {
            res.sendStatus(403);
            return;
        }
        if (req.session.username == item.owner) {
            // delist and restore amount
            item.amount += listing.amount;
            listing.times.expired = current.time;
            setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json([item, listing]), world.interval.minute);
        } else {
            console.log(`TX${activities.length}: buying ${item.id} at ${listing.price}...`);
            const creditTx = {
                type: "transaction" as ActivityType,
                id: `TX${activities.length}`,
                of: "credit",
                from: req.session.username,
                to: item.owner,
                amount: listing.price,
                note: `Purchase of ${item.id} at ${listing.price} credit`,
                times: {
                    created: current.time
                }
            };
            activities.push(creditTx);
            const itemTx = {
                type: "transaction" as ActivityType,
                id: `TX${activities.length}`,
                of: item.id,
                from: item.owner,
                to: req.session.username,
                amount: listing.amount,
                note: `Sale of ${item.id} at ${listing.price} credit`,
                times: {
                    created: current.time
                }
            };
            activities.push(itemTx);
            current.activities.pending.push(creditTx.id);
            current.activities.pending.push(itemTx.id);
            listing.times.sold = current.time;
            setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json([creditTx, itemTx]), world.interval.minute);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/activity/:id', async (req, res) => {
    try {
        const activity = activities.find(a => a.id == req.params.id);
        if (!activity) {
            res.sendStatus(404);
            return;
        }
        res.json(activity);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/asset/:id', async (req, res) => {
    try {
        const asset = assets.find(a => a.id == req.params.id);
        if (!asset) {
            res.sendStatus(404);
            return;
        }
        res.json(asset);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/market/:id', async (req, res) => {
    try {
        const listing = market.find(l => l.id == req.params.id);
        if (!listing) {
            res.sendStatus(404);
            return;
        }
        res.json(listing);
    } catch (error) {
        res.sendStatus(500);
    }
});