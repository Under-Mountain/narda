import express from 'express'
import cors from 'cors'
import minify from 'express-minify'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './auth.js'
import accountsRouter from './accounts.js'
import assetsRouter from './assets.js'
import marketRouter from './market.js'
import pagesRouter from './pages.js'
import activitiesRouter from './activities.js'
import { accounts, assets, current, posts, world } from '../service/model.js'

export const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(session({
    secret: 'afdawdf@#%@#$%fadfn2&@#%4n2n%4*fadf',
    resave: false,
    saveUninitialized: false
}))

app.use(cors())
app.use(minify())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))
app.use('/scripts', express.static(path.join(__dirname, '../client')))
app.use('/common', express.static(path.join(__dirname, '../common')))
app.use(express.urlencoded({ extended: true }))

app.use('/api', authRouter)
app.use('/api', accountsRouter)
app.use('/api', assetsRouter)
app.use('/api', marketRouter)
app.use('/api', pagesRouter)
app.use('/api', activitiesRouter)

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
            setTimeout(
                () => res.json({ global: current, account, inventory, broadcast:getBroadcasts() }),
                world.interval.minute
            );
        } else {
            setTimeout(
                () => res.json({ global: current, broadcast:getBroadcasts() }),
                world.interval.minute
            );
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

export default app;

function getBroadcasts() {
    return posts.filter(p => p.places.indexOf('broadcast') >= 0)
        .sort((a, b) => a.times.created > b.times.created ? -1:1)
        .slice(0, 10)
}
