import { useEffect, useState } from "react";
import TreeNode from "./TreeNode";
import SearchForm from "./SearchForm";
import * as api from "../api/items";
import { useSearch } from "../hooks/useSearch";

function App() {
    const [tree, setTree] = useState(null);
    const { expandIds, isEmpty, onSearchResult } = useSearch();

    useEffect(() => {
        api.getTree().then(setTree);
    }, []);

    return (
        <div className="app">
            <SearchForm onResult={onSearchResult} />

            {isEmpty ? (
                <p className="search-empty">Ничего не найдено</p>
            ) : (
                tree && (
                    <ul className="tree-root">
                        <TreeNode
                            node={tree}
                            isRoot
                            defaultExpanded
                            expandIds={expandIds}
                        />
                    </ul>
                )
            )}
        </div>
    );
}

export { App as default };
