import { useState } from "react";

function collectIds(node, ids = new Set()) {
    if (!node) return ids;
    ids.add(node.id);
    for (const child of node.children ?? []) {
        collectIds(child, ids);
    }
    return ids;
}

export function useSearch() {
    const [expandIds, setExpandIds] = useState(undefined);
    const [isEmpty, setIsEmpty] = useState(false);

    function onSearchResult(result) {
        if (result === undefined) {
            setExpandIds(undefined);
            setIsEmpty(false);
            return;
        }

        setIsEmpty(result.tree?.length === 0);
        setExpandIds(collectIds(result.tree));
    }

    return { expandIds, isEmpty, onSearchResult };
}
