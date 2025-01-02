import express from 'express';
import { market, assets, activities, current, world } from "../service/model.js";
import { ActivityType } from "../interfaces/Activity.js";

const router = express.Router();

router.get('/market', async (req, res) => {
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

router.post('/list', async (req, res) => {
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

router.get('/market/:id', async (req, res) => {
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

router.post('/trade', async (req, res) => {
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

export default router;