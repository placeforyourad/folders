import itemsRepository from "../repository/repository.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../errors.js";

async function getTree() {
    return itemsRepository.getTree();
}

async function createItem({ name, type, parentId }) {
    const parent = await itemsRepository.findById(parentId);

    if (!parent) {
        throw new NotFoundError("Родительский элемент не найден");
    }

    if (parent.type !== "folder") {
        throw new ValidationError(
            "Нельзя создать элемент внутри файла: родитель должен быть папкой",
        );
    }

    return itemsRepository.create({ name: name.trim(), type, parentId });
}

async function deleteItem(id) {
    const item = await itemsRepository.findById(id);

    if (!item) {
        throw new NotFoundError("Элемент не найден");
    }

    if (item.name === "root" && item.parentId === null) {
        throw new ForbiddenError("Root нельзя удалить");
    }

    await itemsRepository.delete(id);
}

async function searchItem(query) {
    return itemsRepository.search(query.trim());
}

export { getTree, createItem, deleteItem, searchItem };
