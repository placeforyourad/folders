import * as trees from "./services/tree.js";
import * as items from "./services/item.js";

async function getTreeHandler(req, res, next) {
    try {
        const tree = await trees.getTree();

        if (!tree) {
            return res.status(404).json({ error: "Root не найден" });
        }

        res.json(tree);
    } catch (error) {
        next(error);
    }
}

async function createItemHandler(req, res, next) {
    try {
        const { name, type, parentId } = req.body;
        const item = await items.createItem({ name, type, parentId });

        res.status(201).json({
            id: item.id,
            name: item.name,
            type: item.type,
            parentId: item.parentId,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteItemHandler(req, res, next) {
    try {
        const { id } = req.params;
        await items.deleteItem(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export { getTreeHandler, createItemHandler, deleteItemHandler };
