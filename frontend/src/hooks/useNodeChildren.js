import { useEffect, useState } from "react";
import * as api from "../api/items";
import * as sync from "../utils/treeSync";

const childrenCache = new Map();

function useNodeChildren(node, { defaultExpanded = false, expandIds } = {}) {
    const [children, setChildrenState] = useState(() => {
        if (node.children !== undefined) return node.children;
        return childrenCache.get(node.id) ?? null;
    });
    const [manualExpanded, setManualExpanded] = useState(defaultExpanded);

    function setChildren(value) {
        if (value) childrenCache.set(node.id, value);
        else childrenCache.delete(node.id);
        setChildrenState(value);
    }

    async function loadChildren() {
        const data = await api.getChildren(node.id);
        setChildren(data);
    }

    useEffect(() => {
        if (!expandIds) return;

        if (expandIds.has(node.id)) {
            setManualExpanded(true);
            if (children === null) {
                loadChildren();
            }
        } else {
            setManualExpanded(false);
        }
    }, [expandIds]);

    useEffect(() => {
        sync.registerRefetch(node.id, async () => {
            const loaded =
                childrenCache.has(node.id) || node.children !== undefined;
            if (!loaded) return;
            const data = await api.getChildren(node.id);
            setChildren(data);
        });
    }, [node.id]);

    async function toggle() {
        if (manualExpanded) {
            setManualExpanded(false);
            return;
        }

        if (children === null) {
            await loadChildren();
        }

        setManualExpanded(true);
    }

    async function addChild({ name, type }) {
        const created = await api.createItem({ name, type, parentId: node.id });
        sync.writeDirtyNodes([node.id]);
        if (children !== null) {
            setChildren([...children, created]);
        }
        return created;
    }

    async function removeChild(id) {
        await api.deleteItem(id);
        sync.writeDirtyNodes([node.id]);
        setChildren(children.filter((child) => child.id !== id));
    }

    return {
        children: children ?? [],
        expanded: manualExpanded,
        toggle,
        addChild,
        removeChild,
    };
}

export { useNodeChildren };
