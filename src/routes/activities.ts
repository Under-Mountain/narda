import { Router } from 'express';
import { activities, world } from "../service/model.js";
import { createActivity, createTransaction } from '../service/activity.js';
import { ActivityType } from '../interfaces/Activity.js';

const router = Router();

router.get('/activities', async (req, res) => {
    try {
        let filteredActivities = activities;
        if (req.query.type) {
            filteredActivities = activities.filter(a => a.type == req.query.type);
        }
        if (req.query.user) {
            filteredActivities = activities.filter(
                a => a.from == req.query.user || a.to == req.query.user
            );
        }
        res.json(filteredActivities);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get('/activity/:id', async (req, res) => {
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

router.post('/transaction', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            res.sendStatus(401);
            return;
        }
        if (!req.body.of || !req.body.to || !req.body.amount) {
            res.sendStatus(400);
            return;
        }
        const activity = createTransaction(
            req.session.username,
            req.body.to,
            Number(req.body.amount)
        );
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