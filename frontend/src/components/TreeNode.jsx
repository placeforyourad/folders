import { useState } from "react";
import { useNodeChildren } from "../hooks/useNodeChildren";
import TreeNodeActions from "./TreeNodeActions";
import TreeNodeAddForm from "./TreeNodeAddForm";
import "../styles/tree.css";

export default function TreeNode({
    node,
    isRoot = false,
    defaultExpanded = false,
    onDeleted,
    expandIds,
}) {
    const [adding, setAdding] = useState(false);
    const { children, expanded, toggle, addChild, removeChild } =
        useNodeChildren(node, { defaultExpanded, expandIds });
    const isFolder = node.type === "folder";

    async function handleDelete() {
        if (!confirm(`Удалить «${node.name}»?`)) return;
        onDeleted ? await onDeleted(node.id) : await removeChild(node.id);
    }

    async function handleCreate(input) {
        try {
            await addChild(input);
            setAdding(false);
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <li className="tree-node">
            <div className="tree-node-row">
                <button
                    type="button"
                    className={`tree-node-label ${isFolder ? "is-folder" : "is-file"}`}
                    onClick={isFolder ? toggle : undefined}
                    disabled={!isFolder}
                >
                    <span className="tree-node-icon">
                        {isFolder ? (expanded ? "📂" : "📁") : "📄"}
                    </span>
                    <span className="tree-node-name">{node.name}</span>
                </button>

                <TreeNodeActions
                    isFolder={isFolder}
                    isRoot={isRoot}
                    adding={adding}
                    onToggleAdd={() => setAdding((prev) => !prev)}
                    onDelete={handleDelete}
                />
            </div>

            {adding && (
                <TreeNodeAddForm
                    onSubmit={handleCreate}
                    onCancel={() => setAdding(false)}
                />
            )}

            {expanded && children.length > 0 && (
                <ul className="tree-children">
                    {children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onDeleted={removeChild}
                            expandIds={expandIds}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
