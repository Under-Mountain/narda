import express from 'express';
import { market, assets, activities, current, world } from "../service/model.js";
import { ActivityType } from "../interfaces/Activity.js";
import { createTransaction, trade } from '../service/activity.js';

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
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(listing),
            world.interval.minute
        );
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
        const result = trade(req.session.username, listing, item);
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(result),
            world.interval.minute
        );
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;