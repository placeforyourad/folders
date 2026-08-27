import express from "express";
import { createItem } from "../services/items.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const { name, type, parentId } = req.body;
        const item = await createItem({ name, type, parentId });

        res.json({
            id: item.id,
            name: item.name,
            type: item.type,
            parentId: item.parentId,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
