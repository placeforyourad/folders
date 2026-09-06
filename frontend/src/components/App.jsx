import { useEffect, useState } from "react";
import TreeNode from "./TreeNode";
import { getTree } from "../api/items.js";

export default function App() {
    const [tree, setTree] = useState(null);

    useEffect(() => {
        getTree().then(setTree);
    }, []);

    if (!tree) return <p>Загрузка...</p>;

    return (
        <ul>
            <TreeNode node={tree} defaultExpanded />
        </ul>
    );
}