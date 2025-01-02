import express from 'express';
import { auth } from "../service/model.js";
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/auth', async (req, res) => {
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

router.get('/auths', async (req, res) => {
    try {
        res.json(auth);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get('/exit', async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) console.warn(err);
            res.redirect('/');
        });
    } catch (error) {
        res.sendStatus(500);
    }
});

export default router;