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
        const grandchildren = await prisma.item.findMany({
            where: { parentId: { in: children.map((child) => child.id) } },
        });

        const childrenByParent = this.#groupByParent([
            ...children,
            ...grandchildren,
        ]);

        return this.#buildNodeShallow(root, childrenByParent);
    }

    async getChildren(parentId) {
        const children = await this.findChildren(parentId);

        const subChildren = await prisma.item.findMany({
            where: { parentId: { in: children.map((c) => c.id) } },
        });

        return this.#mapChildrenWithPresence(children, subChildren);
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

    #groupByParent(items) {
        const childrenByParent = new Map();

        for (const item of items) {
            const siblings = childrenByParent.get(item.parentId) ?? [];
            siblings.push(item);
            childrenByParent.set(item.parentId, siblings);
        }

        return childrenByParent;
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

            for (
                let parent = byId.get(match.parentId);
                parent;
                parent = byId.get(parent.parentId)
            ) {
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

    #mapChildrenWithPresence(children, subChildren) {
        return children.map((child) => ({
            id: child.id,
            name: child.name,
            type: child.type,
            hasChildren: subChildren.some((sc) => sc.parentId === child.id),
        }));
    }

    #buildNodeShallow(item, childrenByParent) {
        const node = {
            id: item.id,
            name: item.name,
            type: item.type,
            parentId: item.parentId,
        };

        if (item.type === "folder") {
            const children = childrenByParent.get(item.id) ?? [];
            const subChildren = children.flatMap(
                (c) => childrenByParent.get(c.id) ?? [],
            );
            node.children = this.#mapChildrenWithPresence(children, subChildren);
        }

        return node;
    }
}

export default new ItemsRepository();
