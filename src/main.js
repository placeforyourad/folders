import app from "./app.js";

const port = 3001;

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
