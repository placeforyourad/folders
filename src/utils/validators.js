import { ValidationError } from "../errors.js";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES = ["folder", "file"];

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
}

function isValidUuid(value) {
    return typeof value === "string" && UUID_REGEX.test(value);
}

function isValidType(value) {
    return VALID_TYPES.includes(value);
}

function validateCreateItem(req, res, next) {
    const { name, type, parentId } = req.body;

    if (!isNonEmptyString(name)) {
        return next(
            new ValidationError("Поле name обязательно и не может быть пустым"),
        );
    }

    if (!isValidType(type)) {
        return next(
            new ValidationError("Поле type должно быть 'folder' или 'file'"),
        );
    }

    if (!isNonEmptyString(parentId) || !isValidUuid(parentId)) {
        return next(
            new ValidationError(
                "Поле parentId обязательно и должно быть валидным UUID",
            ),
        );
    }

    next();
}

function validateDeleteItem(req, res, next) {
    const { id } = req.params;

    if (!isNonEmptyString(id) || !isValidUuid(id)) {
        return next(
            new ValidationError(
                "Поле id обязательно и должно быть валидным UUID",
            ),
        );
    }

    next();
}

export { validateCreateItem, validateDeleteItem };
