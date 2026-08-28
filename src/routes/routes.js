import express from "express";
import {
    getTreeHandler,
    createItemHandler,
    deleteItemHandler,
} from "../controller.js";

const router = express.Router();

router.get("/", getTreeHandler);
router.post("/item", createItemHandler);
router.delete("/item/:id", deleteItemHandler);

export default router;
