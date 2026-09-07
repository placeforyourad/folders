import { useState } from "react";
import { getChildren } from "../api/items";

export default function TreeNode({ node, defaultExpanded = false }) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [fetchedChildren, setFetchedChildren] = useState(null);

    const isFolder = node.type === "folder";
    const children = node.children ?? fetchedChildren ?? [];

    async function handleToggle() {
        if (expanded) {
            setExpanded(false);
            return;
        }

        const alreadyHaveData = node.children !== undefined || fetchedChildren !== null;

        if (!alreadyHaveData && node.hasChildren) {
            const data = await getChildren(node.id);
            setFetchedChildren(data);
        }

        setExpanded(true);
    }

    return (
        <li>
            <span
                onClick={isFolder ? handleToggle : undefined}
                style={{ cursor: isFolder ? "pointer" : "default" }}
            >
                {isFolder ? (expanded ? "📂 " : "📁 ") : "📄 "}
                {node.name}
            </span>

            {expanded && children.length > 0 && (
                <ul>
                    {children.map((child) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
}
