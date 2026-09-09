const DIRTY_KEY = "dirtyNodes";
const refetchRegistry = new Map();

function readDirtyNodes() {
    return JSON.parse(localStorage.getItem(DIRTY_KEY)) ?? [];
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
    localStorage.removeItem(DIRTY_KEY);
    notifyRefetch(dirty);
}

function registerRefetch(nodeId, refetch) {
    refetchRegistry.set(nodeId, refetch);
}

function writeDirtyNode(nodeId) {
    const merged = Array.from(new Set([...readDirtyNodes(), nodeId]));
    localStorage.setItem(DIRTY_KEY, JSON.stringify(merged));
}

window.addEventListener("storage", (event) => {
    if (event.key !== DIRTY_KEY) return;
    consumeDirtyNodes();
});

export { registerRefetch, writeDirtyNode };
