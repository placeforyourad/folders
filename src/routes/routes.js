import express from "express";
import {
    getTreeHandler,
    getChildrenHandler,
    createItemHandler,
    deleteItemHandler,
    searchItemHandler,
} from "../controllers/treeController.js";
import {
    validateCreateItem,
    validateGetItem,
    validateSearchItem,
} from "../utils/validators.js";

const router = express.Router();

router.get("/", getTreeHandler);
router.get("/:id/children", [validateGetItem, getChildrenHandler]);
router.post("/item", [validateCreateItem, createItemHandler]);
router.delete("/item/:id", [validateGetItem, deleteItemHandler]);
router.get("/search", [validateSearchItem, searchItemHandler]);

export default router;
