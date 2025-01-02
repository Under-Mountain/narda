import express from 'express';
import { assets, activities, accounts, current, auth, world } from "../service/model.js";
import { createActivity, consume, collect } from '../service/activity.js';
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
        setTimeout(() => req.query.return ? res.redirect(req.query.return as string) : res.json(activity), world.interval.minute);
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;