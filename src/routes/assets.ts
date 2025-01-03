import express from 'express';
import { assets, activities, accounts, current, auth, world } from "../service/model.js";
import { createActivity, consume, collect, mintAsset } from '../service/activity.js';
import { ActivityType } from "../interfaces/Activity.js";
import bcrypt from 'bcrypt';
import { getRandomNumber, getStats } from '../common/utility.js';

const router = express.Router();

router.get('/assets', async (req, res) => {
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

router.get('/asset/:id', async (req, res) => {
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

router.post('/mint', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        const { activity, consumptions } = await mintAsset(
            req.body.type,
            req.session.username,
            req.body.password,
            req.body.invitation
        );
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(`/?user=${req.session.username}`)
                    : res.json([activity, ...consumptions]),
            world.interval.minute
        );
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/collect', async (req, res) => {
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
                amount = getRandomNumber(0, 100);
                if (world.resources.water.balance - amount < 0) {
                    console.log(`not enough water to collect`);
                    res.sendStatus(403);
                    return;
                }
                break;
            case "mineral":
                amount = getRandomNumber(0, 20);
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
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(activity),
            world.interval.minute
        );
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;