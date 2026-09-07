import { useEffect, useState } from "react";
import { getChildren, deleteItem, createItem } from "../api/items";

const childrenCache = new Map();

export function useNodeChildren(
    node,
    { defaultExpanded = false, expandIds } = {},
) {
    const [children, setChildrenState] = useState(() => {
        if (node.children !== undefined) return node.children;
        return childrenCache.get(node.id) ?? null;
    });
    const [manualExpanded, setManualExpanded] = useState(defaultExpanded);
    const [isLoading, setIsLoading] = useState(false);

    function setChildren(value) {
        if (value) childrenCache.set(node.id, value);
        else childrenCache.delete(node.id);
        setChildrenState(value);
    }

    async function loadChildren() {
        setIsLoading(true);
        try {
            const data = await getChildren(node.id);
            setChildren(data);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (expandIds?.has(node.id)) {
            setManualExpanded(true);
            if (children === null && node.hasChildren) {
                loadChildren();
            }
        }
    }, [expandIds]);

    async function toggle() {
        if (manualExpanded) {
            setManualExpanded(false);
            return;
        }

        if (children === null && node.hasChildren) {
            await loadChildren();
        }

        setManualExpanded(true);
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
        expanded: manualExpanded,
        isLoading,
        toggle,
        addChild,
        removeChild,
    };
}
