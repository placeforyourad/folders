import TreeNode from "./TreeNode";
import SearchForm from "./SearchForm";
import { useSearch } from "../hooks/useSearch";
import { useTree } from "../hooks/useTree";
import { invalidateCache } from "../hooks/useNodeChildren";

function App() {
    const { tree, load, addChild, removeChild } = useTree();
    const { results, isEmpty, onSearchResult } = useSearch();

    function handleSearchResult(result) {
        if (results) invalidateCache(results);
        onSearchResult(result);
        if (result === undefined) load();
    }

    const current = results ?? tree;

    return (
        <div className="app">
            <SearchForm onResult={handleSearchResult} />

            {isEmpty ? (
                <p className="search-empty">Ничего не найдено</p>
            ) : current ? (
                <ul className={`tree-root${results ? " search-results" : ""}`}>
                    <TreeNode
                        node={current}
                        isRoot
                        defaultExpanded
                        onAdd={addChild}
                        onDelete={removeChild}
                    />
                </ul>
            ) : null}
        </div>
    );
}

export { App as default };