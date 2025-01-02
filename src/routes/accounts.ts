import express from 'express';
import { accounts, activities, current, world } from "../service/model.js";
import { consume } from '../service/activity.js';

const router = express.Router();

router.get('/accounts', async (req, res) => {
    try {
        res.json(accounts);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/edit', async (req, res) => {
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

export default router;