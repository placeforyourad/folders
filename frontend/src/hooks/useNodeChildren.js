import { useEffect, useState } from "react";
import { getChildren, deleteItem, createItem } from "../api/items";

const childrenCache = new Map();

export function useNodeChildren(node, { initialExpanded = false } = {}) {
    const [children, setChildrenState] = useState(() => {
        if (node.children !== undefined) return node.children;
        return childrenCache.get(node.id) ?? null;
    });
    const [expanded, setExpanded] = useState(initialExpanded);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialExpanded && children === null && node.hasChildren) {
            setIsLoading(true);
            getChildren(node.id)
                .then(setChildren)
                .finally(() => setIsLoading(false));
        }
    }, []);

    function setChildren(value) {
        if (value) childrenCache.set(node.id, value);
        else childrenCache.delete(node.id);
        setChildrenState(value);
    }

    async function toggle() {
        if (expanded) {
            setExpanded(false);
            return;
        }

        if (children === null && node.hasChildren) {
            setIsLoading(true);
            try {
                const data = await getChildren(node.id);
                setChildren(data);
            } finally {
                setIsLoading(false);
            }
        }

        setExpanded(true);
    }

    async function addChild({ name, type }) {
        const created = await createItem({ name, type, parentId: node.id });
        setChildren([...(children ?? []), created]);
        return created;
    }

    async function removeChild(id) {
        await deleteItem(id);
        setChildren((children ?? []).filter((child) => child.id !== id));
    }

    return {
        children: children ?? [],
        expanded,
        isLoading,
        toggle,
        addChild,
        removeChild,
    };
}
