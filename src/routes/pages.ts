import express from 'express';
import { consume } from "../service/activity.js";
import { accounts, posts, activities, current, world } from "../service/model.js";
import { app } from "./api.js";

const router = express.Router();

router.post('/comment', async (req, res) => {
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

router.post('/like', async (req, res) => {
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

router.post('/post', async (req, res) => {
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

export default router