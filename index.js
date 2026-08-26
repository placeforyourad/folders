const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/folders", async (req, res) => {
    try {
        const { name } = req.body;
        const folder = await prisma.folder.create({
            data: { name },
        });
        res.json(folder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/folders", async (req, res) => {
    try {
        const folders = await prisma.folder.findMany();
        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/folders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const folder = await prisma.folder.update({
            where: { id: parseInt(id) },
            data: { name },
        });
        res.json(folder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/folders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.folder.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: "Folder deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
