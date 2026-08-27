import { ValidationError, NotFoundError, ForbiddenError } from "../errors.js";

function errorHandler(error, req, res) {
    if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
        return res.status(403).json({ error: error.message });
    }

    console.error("Необработанная ошибка:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
}

export default errorHandler;
