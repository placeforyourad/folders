import prisma from "../prisma.js";
import { NotFoundError } from "../errors.js";

async function findAllItems() {
    return prisma.item.findMany({
        orderBy: { name: "asc" },
    });
}

async function findItemById(id) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
        throw new NotFoundError("Элемент не найден");
    }

    return item;
}

async function insertItem({ name, type, parentId }) {
    return prisma.item.create({
        data: { name, type, parentId },
    });
}

async function deleteItemById(id) {
    return prisma.item.delete({
        where: { id },
    });
}

export { findAllItems, findItemById, insertItem, deleteItemById };
