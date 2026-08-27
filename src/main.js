const express = require("express");
const prisma = require("./prisma");

const app = express();
const port = 3001;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
