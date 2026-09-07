import { useState } from "react";

function collectIds(node, ids = new Set()) {
    if (!node) return ids;
    ids.add(node.id);
    for (const child of node.children ?? []) {
        collectIds(child, ids);
    }
    return ids;
}

export function useSearchHighlights() {
    const [searchResult, setSearchResult] = useState(undefined);

    const forceExpandedIds =
        searchResult === undefined
            ? undefined
            : searchResult.tree
              ? collectIds(searchResult.tree)
              : new Set();

    return { searchResult, forceExpandedIds, onSearchResult: setSearchResult };
}
