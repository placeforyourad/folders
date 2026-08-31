import {
    getTree,
    createItem,
    deleteItem,
    searchItem,
} from "../services/tree.js";

async function getTreeHandler(req, res, next) {
    try {
        const tree = await getTree();

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
        const item = await createItem({ name, type, parentId });

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
        await deleteItem(id);

        res.json({ message: "Элемент удалён" });
    } catch (error) {
        next(error);
    }
}

async function searchItemHandler(req, res, next) {
    try {
        const item = await searchItem(req.query.query);

        res.json({ results: item });
    } catch (error) {
        next(error);
    }
}

export {
    getTreeHandler,
    createItemHandler,
    deleteItemHandler,
    searchItemHandler,
};
