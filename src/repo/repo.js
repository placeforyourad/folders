import prisma from "../prisma.js";

async function findAllItems() {
    return prisma.item.findMany({
        orderBy: { name: "asc" },
    });
}

async function findItemById(id) {
    return prisma.item.findUnique({ where: { id } });
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
