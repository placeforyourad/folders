import prisma from "../prisma.js";

class ItemsRepository {
    async findAll() {
        return prisma.item.findMany();
    }

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
        const { items, childrenByParent } = await this.#loadIndexed();
        const root = items.find((item) => item.parentId === null);

        if (!root) {
            return null;
        }

        return this.#buildNode(root, childrenByParent);
    }

    async search(query) {
        const matches = await prisma.item.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
        });

        if (matches.length === 0) return [];

        const matchIds = new Set(matches.map((m) => m.id));
        const byId = new Map(matches.map((m) => [m.id, m]));

        let frontier = matches;

        while (frontier.length) {
            const parentIds = [
                ...new Set(
                    frontier
                        .map((i) => i.parentId)
                        .filter((id) => id && !byId.has(id)),
                ),
            ];

            if (!parentIds.length) break;

            const parents = await prisma.item.findMany({
                where: { id: { in: parentIds } },
            });

            for (const p of parents) byId.set(p.id, p);

            frontier = parents;
        }

        const results = [];

        for (const match of matches) {
            const path = this.#pathToRoot(match, byId);

            if (path.some((a) => a.id !== match.id && matchIds.has(a.id)))
                continue;

            results.push(this.#buildPathFromAncestors(path));
        }

        return results;
    }

    #pathToRoot(item, byId) {
        const path = [];

        for (let node = item; node; node = byId.get(node.parentId) ?? null) {
            path.unshift(node);
        }

        return path;
    }

    #buildPathFromAncestors(path) {
        const childrenByParent = new Map();

        for (let i = 1; i < path.length; i++) {
            childrenByParent.set(path[i].id, [path[i - 1]]);
        }

        return this.#buildNode(path[path.length - 1], childrenByParent);
    }

    async #loadIndexed() {
        const items = await this.findAll();
        return {
            items,
            childrenByParent: this.#groupByParent(items),
        };
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
