const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.item.findFirst({
        where: { name: "root", parentId: null },
    });

    if (!existing) {
        await prisma.item.create({ data: { name: "root", type: "folder" } });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
