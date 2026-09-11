import { useEffect, useRef, useState } from "react";
import * as api from "../api/items";

const childrenCache = new Map();

function invalidateCache(tree) {
    if (!tree) return;
    const stack = [tree];
    while (stack.length) {
        const node = stack.pop();
        childrenCache.delete(node.id);
        if (node.children) stack.push(...node.children);
    }
}

function useNodeChildren(node, { defaultExpanded = false, onAdd, onDelete } = {}) {
    const [children, setChildrenState] = useState(() => {
        if (node.children !== undefined) return node.children;
        return childrenCache.get(node.id) ?? null;
    });
    const [manualExpanded, setManualExpanded] = useState(defaultExpanded);
    const prevNodeRef = useRef(node);

    useEffect(() => {
        if (prevNodeRef.current === node) return;
        prevNodeRef.current = node;
        setChildrenState(
            node.children !== undefined ? node.children : childrenCache.get(node.id) ?? null
        );
        setManualExpanded(defaultExpanded);
    });

    function setChildren(value) {
        if (value) childrenCache.set(node.id, value);
        else childrenCache.delete(node.id);
        setChildrenState(value);
    }

    async function loadChildren() {
        const data = await api.getChildren(node.id);
        setChildren(data);
    }

    async function toggle() {
        if (!manualExpanded && children === null) {
            await loadChildren();
        }
        setManualExpanded((prev) => !prev);
    }

    async function addChild({ name, type }) {
        const created = await api.createItem({ name, type, parentId: node.id });
        await loadChildren();
        setManualExpanded(true);
        onAdd?.(node.id, created);
        return created;
    }

    async function removeChild(id) {
        await api.deleteItem(id);
        setChildren(children.filter((child) => child.id !== id));
        onDelete?.(id);
    }

    return {
        children: children ?? [],
        expanded: manualExpanded,
        toggle,
        addChild,
        removeChild,
    };
}

export { useNodeChildren, invalidateCache };
