import { useContext, useEffect, useState } from "react";
import { getChildren, deleteItem, createItem } from "../api/items";
import { ForceExpandedContext } from "../context/forceExpandedContext";

const childrenCache = new Map();

export function useNodeChildren(node, { defaultExpanded = false } = {}) {
    const forceExpandedIds = useContext(ForceExpandedContext);
    const isForced = forceExpandedIds?.has(node.id) ?? false;
    const isSearching = forceExpandedIds !== undefined;

    const [children, setChildrenState] = useState(() => {
        if (node.children !== undefined) return node.children;
        return childrenCache.get(node.id) ?? null;
    });
    const [manualExpanded, setManualExpanded] = useState(defaultExpanded);
    const [isLoading, setIsLoading] = useState(false);

    const expanded = isSearching ? isForced : manualExpanded;

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
        if (isForced && children === null && node.hasChildren) {
            loadChildren();
        }
    }, [isForced]);

    async function toggle() {
        if (expanded) {
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
        expanded,
        isLoading,
        toggle,
        addChild,
        removeChild,
    };
}
