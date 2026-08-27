const prisma = require("../prisma");

async function findAllItems() {
    return prisma.item.findMany({
        orderBy: { name: "asc" },
    });
}

module.exports = { findAllItems };
