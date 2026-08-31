import express from "express";
import {
    getTreeHandler,
    createItemHandler,
    deleteItemHandler,
    searchItemHandler,
} from "../controllers/treeController.js";
import {
    validateCreateItem,
    validateDeleteItem,
    validateSearchItem,
} from "../utils/validators.js";

const router = express.Router();

router.get("/", getTreeHandler);
router.post("/item", [validateCreateItem, createItemHandler]);
router.delete("/item/:id", [validateDeleteItem, deleteItemHandler]);
router.get("/search", [validateSearchItem, searchItemHandler]);

export default router;
