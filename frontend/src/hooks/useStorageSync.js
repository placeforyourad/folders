import { useEffect } from "react";

const DIRTY_KEY = "dirtyNodes";
const refetchRegistry = new Map();

function readDirtyNodes() {
    try {
        return JSON.parse(localStorage.getItem(DIRTY_KEY)) ?? [];
    } catch {
        return [];
    }
}

function clearDirtyNodes() {
    localStorage.removeItem(DIRTY_KEY);
}

function notifyRefetch(nodeIds) {
    for (const nodeId of nodeIds) {
        const refetch = refetchRegistry.get(nodeId);
        if (refetch) refetch();
    }
}

function consumeDirtyNodes() {
    const dirty = readDirtyNodes();
    if (dirty.length === 0) return;
    clearDirtyNodes();
    notifyRefetch(dirty);
}

function registerRefetch(nodeId, refetch) {
    refetchRegistry.set(nodeId, refetch);
}

function writeDirtyNodes(nodeIds) {
    const merged = Array.from(new Set([...readDirtyNodes(), ...nodeIds]));
    localStorage.setItem(DIRTY_KEY, JSON.stringify(merged));
}

function useStorageSync() {
    useEffect(() => {
        function handleStorage(event) {
            if (event.key !== DIRTY_KEY) return;
            consumeDirtyNodes();
        }

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);
}

export { registerRefetch, writeDirtyNodes, useStorageSync };
