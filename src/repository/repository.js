import prisma from "../prisma.js";

class ItemsRepository {
    async findById(id) {
        return prisma.item.findUnique({ where: { id } });
    }

    async findChildren(parentId) {
        return prisma.item.findMany({
            where: { parentId },
        });
    }

    async create({ name, type, parentId }) {
        return prisma.item.create({ data: { name, type, parentId } });
    }

    async delete(id) {
        return prisma.item.delete({ where: { id } });
    }

    async getTree() {
        const root = await prisma.item.findFirst({
            where: { parentId: null },
        });

        if (!root) return null;

        const children = await prisma.item.findMany({
            where: { parentId: root.id },
        });

        return {
            id: root.id,
            name: root.name,
            type: root.type,
            parentId: root.parentId,
            children: this.#toShallow(children),
        };
    }

    async getChildren(parentId) {
        const children = await this.findChildren(parentId);

        return this.#toShallow(children);
    }

    async search(query) {
        const matches = await prisma.item.findMany({
            where: {
                name: { contains: query, mode: "insensitive" },
            },
        });

        if (!matches.length) return [];

        const byId = new Map(matches.map((item) => [item.id, item]));
        await this.#collectAncestors(matches, byId);

        return this.#buildSearchTree(matches, byId);
    }

    async #collectAncestors(frontier, byId) {
        while (frontier.length) {
            const parentIds = [];

            for (const item of frontier) {
                if (item.parentId && !byId.has(item.parentId)) {
                    parentIds.push(item.parentId);
                }
            }

            if (!parentIds.length) break;

            const parents = await prisma.item.findMany({
                where: { id: { in: parentIds } },
            });

            parents.forEach((parent) => byId.set(parent.id, parent));
            frontier = parents;
        }
    }

    #toShallow(items) {
        return items.map(({ id, name, type }) => ({ id, name, type }));
    }

    #buildSearchTree(matches, byId) {
        const nodes = new Map();
        const getNode = (item) => {
            if (!nodes.has(item.id)) {
                const { id, name, type } = item;
                nodes.set(id, { id, name, type, children: [] });
            }
            return nodes.get(item.id);
        };

        let root;

        for (const match of matches) {
            let child = getNode(match);
            if (!root) root = child;

            for (let parent = byId.get(match.parentId); parent; parent = byId.get(parent.parentId)) {
                const parentNode = getNode(parent);
                if (!parentNode.children.includes(child)) {
                    parentNode.children.push(child);
                }
                child = parentNode;
                root = parentNode;
            }
        }

        return root;
    }
}

export default new ItemsRepository();
