import { ValidationError } from "../errors.js";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES = ["folder", "file"];

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const isUuid = (v) => typeof v === "string" && UUID_REGEX.test(v);
const isValidType = (v) => VALID_TYPES.includes(v);

function validate(source, rules) {
    return (req, res, next) => {
        for (const [field, check, message] of rules) {
            if (!check(req[source][field])) {
                return next(new ValidationError(message));
            }
        }
        next();
    };
}

const validateCreateItem = validate("body", [
    ["name", isNonEmptyString, "Поле name обязательно и не может быть пустым"],
    ["type", isValidType, "Поле type должно быть 'folder' или 'file'"],
    ["parentId", isUuid, "Поле parentId обязательно и должно быть валидным UUID",],
]);

const validateDeleteItem = validate("params", [
    ["id", isUuid, "Поле id обязательно и должно быть валидным UUID"],
]);

const validateSearchItem = validate("query", [
    ["query", isNonEmptyString, "Параметр query обязателен и не может быть пустым",],
]);

export { validateCreateItem, validateDeleteItem, validateSearchItem };