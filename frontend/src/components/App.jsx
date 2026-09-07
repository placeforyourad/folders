import { useEffect, useState } from "react";
import TreeNode from "./TreeNode";
import SearchForm from "./SearchForm";
import { getTree } from "../api/items";
import { ForceExpandedContext } from "../context/forceExpandedContext";
import { useSearchHighlights } from "../hooks/useSearchHighlights";

export default function App() {
    const [tree, setTree] = useState(null);
    const { searchResult, forceExpandedIds, onSearchResult } =
        useSearchHighlights();

    useEffect(() => {
        getTree().then(setTree);
    }, []);

    return (
        <div className="app">
            <SearchForm onResult={onSearchResult} />

            {searchResult && !searchResult.tree ? (
                <p className="search-empty">Ничего не найдено</p>
            ) : (
                <ForceExpandedContext.Provider value={forceExpandedIds}>
                    {tree && (
                        <ul className="tree-root">
                            <TreeNode node={tree} isRoot defaultExpanded />
                        </ul>
                    )}
                </ForceExpandedContext.Provider>
            )}
        </div>
    );
}
