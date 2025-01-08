import express from 'express';
import { comment, like, postContent } from "../service/activity.js";
import { world } from "../service/model.js";

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
        const post = comment(req.session.username, req.body.postId, req.body.comment);
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(post),
            world.interval.minute
        );
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
            res.sendStatus(400);
            return;
        }
        const post = like(req.session.username, req.body.postId, !!req.body.dislike);
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(post),
            world.interval.minute
        );
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
        const post = postContent(
            req.session.username,
            req.body.title,
            req.body.content,
            req.body.places
        );
        setTimeout(
            () =>
                req.query.return
                    ? res.redirect(req.query.return as string)
                    : res.json(post),
            world.interval.minute
        );
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;