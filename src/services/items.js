import { findItemById, insertItem } from "../repo/repo.js";
import { ValidationError, NotFoundError } from "../errors.js";

const VALID_TYPES = ["folder", "file"];
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateCreateItemInput({ name, type, parentId }) {
    if (typeof name !== "string" || name.trim() === "") {
        throw new ValidationError(
            "Поле name обязательно и не может быть пустым",
        );
    }

    if (!VALID_TYPES.includes(type)) {
        throw new ValidationError("Поле type должно быть 'folder' или 'file'");
    }

    if (typeof parentId !== "string" || !UUID_REGEX.test(parentId)) {
        throw new ValidationError(
            "Поле parentId обязательно и должно быть валидным UUID",
        );
    }
}

async function createItem({ name, type, parentId }) {
    validateCreateItemInput({ name, type, parentId });

    const parent = await findItemById(parentId);

    if (!parent) {
        throw new NotFoundError("Родительский элемент не найден");
    }

    if (parent.type !== "folder") {
        throw new ValidationError(
            "Нельзя создать элемент внутри файла: родитель должен быть папкой",
        );
    }

    return insertItem({ name: name.trim(), type, parentId });
}

export { createItem };
