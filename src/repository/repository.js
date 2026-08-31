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
        const { items, childrenByParent } = await this.#loadIndexed();
        const root = items.find((item) => item.parentId === null);

        if (!root) {
            return null;
        }

        return this.#buildNode(root, childrenByParent);
    }

    async search(query) {
        const { items, itemsById } = await this.#loadIndexed();

        const matches = items.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
        );

        const ancestorIds = new Set();
        for (const match of matches) {
            for (const id of this.#collectAncestorIds(match, itemsById)) {
                ancestorIds.add(id);
            }
        }

        const leafMatches = matches.filter((match) => !ancestorIds.has(match.id));

        return leafMatches.map((match) => this.#buildPathToRoot(match, itemsById));
    }

    async #loadIndexed() {
        const items = await this.findAll();
        return {
            items,
            itemsById: new Map(items.map((item) => [item.id, item])),
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

    #getPathToRoot(item, itemsById) {
        const path = [item];
        let current = item;

        while (current.parentId) {
            current = itemsById.get(current.parentId);
            path.push(current);
        }

        return path;
    }

    #collectAncestorIds(item, itemsById) {
        const path = this.#getPathToRoot(item, itemsById);
        return new Set(path.slice(1).map((ancestor) => ancestor.id));
    }

    #buildPathToRoot(item, itemsById) {
        const path = this.#getPathToRoot(item, itemsById);
        const childrenByParent = new Map();

        for (let i = 1; i < path.length; i++) {
            childrenByParent.set(path[i].id, [path[i - 1]]);
        }

        const root = path[path.length - 1];
        return this.#buildNode(root, childrenByParent);
    }
}

export default new ItemsRepository();
