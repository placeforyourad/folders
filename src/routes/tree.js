const express = require("express");
const { getTree } = require("../services/service");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const tree = await getTree();

        if (!tree) {
            return res.status(404).json({ error: "Root не найден" });
        }

        res.json(tree);
    } catch (error) {
        console.error("Ошибка при построении дерева:", error);

        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;
