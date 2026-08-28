import { findItemById, insertItem, deleteItemById } from "../repo/repo.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../errors.js";
import * as validate from "../utils/validators.js";

const VALID_TYPES = ["folder", "file"];
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateCreateItemInput({ name, type, parentId }) {
    if (!validate.isNonEmptyString(name)) {
        throw new ValidationError(
            "Поле name обязательно и не может быть пустым",
        );
    }

    if (!VALID_TYPES.includes(type)) {
        throw new ValidationError("Поле type должно быть 'folder' или 'file'");
    }

    if (
        !validate.isNonEmptyString(parentId) ||
        !validate.isValidUuid(parentId)
    ) {
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

async function deleteItem(id) {
    if (!validate.isNonEmptyString(id) || !validate.isValidUuid(id)) {
        throw new ValidationError(
            "Поле id обязательно и должно быть валидным UUID",
        );
    }

    const item = await findItemById(id);

    if (!item) {
        throw new NotFoundError("Элемент не найден");
    }

    if (item.name === "root" && item.parentId === null) {
        throw new ForbiddenError("Root нельзя удалить");
    }

    await deleteItemById(id);

    return { message: "Item deleted successfully" };
}

export { createItem, deleteItem };
