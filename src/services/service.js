const { findAllItems } = require("../repo/repo");

function groupByParent(items) {
    const childrenByParent = new Map();

    for (const item of items) {
        const siblings = childrenByParent.get(item.parentId) ?? [];
        siblings.push(item);
        childrenByParent.set(item.parentId, siblings);
    }

    return childrenByParent;
}

function buildTree(parentId, childrenByParent) {
    const children = childrenByParent.get(parentId) ?? [];

    return children.map((item) => {
        const node = { id: item.id, name: item.name, type: item.type };

        if (item.type === "folder") {
            node.children = buildTree(item.id, childrenByParent);
        }

        return node;
    });
}

async function getTree() {
    const items = await findAllItems();
    const root = items.find(
        (item) => item.name === "root" && item.parentId === null,
    );

    if (!root) {
        return null;
    }

    const childrenByParent = groupByParent(items);

    return {
        id: root.id,
        name: root.name,
        type: root.type,
        children: buildTree(root.id, childrenByParent),
    };
}

module.exports = { getTree };
