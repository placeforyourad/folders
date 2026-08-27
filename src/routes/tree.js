import express from "express";
import { getTree } from "../services/tree.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const tree = await getTree();

        if (!tree) {
            return res.status(404).json({ error: "Root не найден" });
        }

        res.json(tree);
    } catch (error) {
        next(error);
    }
});

export default router;
