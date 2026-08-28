import express from "express";
import {
    getTreeHandler,
    createItemHandler,
    deleteItemHandler,
} from "../controllers/treeController.js";
import { validateCreateItem, validateDeleteItem } from "../utils/validators.js";

const router = express.Router();

router.get("/", getTreeHandler);
router.post("/item", [validateCreateItem, createItemHandler]);
router.delete("/item/:id", [validateDeleteItem, deleteItemHandler]);

export default router;
