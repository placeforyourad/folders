import prisma from "../prisma.js";

class ItemsRepository {
    async findAll() {
        return prisma.item.findMany({ orderBy: { name: "asc" } });
    }

    async findById(id) {
        return prisma.item.findUnique({ where: { id } });
    }

    async create({ name, type, parentId }) {
        return prisma.item.create({ data: { name, type, parentId } });
    }

    async delete(id) {
        return prisma.item.delete({ where: { id } });
    }

    async getTree() {
        const items = await this.findAll();
        const root = items.find((item) => item.parentId === null);

        if (!root) {
            return null;
        }

        const childrenByParent = this.#groupByParent(items);
        return this.#buildNode(root, childrenByParent);
    }

    #groupByParent(items) {
        const childrenByParent = new Map();

        for (const item of items) {
            const siblings = childrenByParent.get(item.parentId) ?? [];
            siblings.push(item);
            childrenByParent.set(item.parentId, siblings);
        }

        return childrenByParent;
    }

    #buildNode(item, childrenByParent) {
        const node = { id: item.id, name: item.name, type: item.type };

        if (item.type === "folder") {
            const children = childrenByParent.get(item.id) ?? [];
            node.children = children.map((child) =>
                this.#buildNode(child, childrenByParent),
            );
        }

        return node;
    }
}

export default new ItemsRepository();
