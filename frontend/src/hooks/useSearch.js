import { useState } from "react";

function useSearch() {
    const [results, setResults] = useState();

    function onSearchResult(result) {
        if (result === undefined) {
            setResults(undefined);
            return;
        }
        setResults(result.tree ?? null);
    }

    return { results, isEmpty: results === null, onSearchResult };
}

export { useSearch };