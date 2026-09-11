import { useEffect, useState } from "react";
import * as api from "../api/items";

function useTree() {
    const [tree, setTree] = useState(null);

    useEffect(() => {
        api.getTree().then(setTree);
    }, []);

    function load() {
        api.getTree().then(setTree);
    }

    function addChild(parentId, child) {
        setTree((prev) => {
            if (!prev) return prev;

            function update(node) {
                if (node.id === parentId) {
                    return { ...node, children: [...(node.children ?? []), child] };
                }
                if (!node.children?.length) return node;
                return { ...node, children: node.children.map(update) };
            }

            return update(prev);
        });
    }

    function removeChild(childId) {
        setTree((prev) => {
            if (!prev) return prev;

            function update(node) {
                if (!node.children?.length) return node;
                return {
                    ...node,
                    children: node.children
                        .filter((c) => c.id !== childId)
                        .map(update),
                };
            }

            return update(prev);
        });
    }

    return { tree, load, addChild, removeChild };
}

export { useTree };