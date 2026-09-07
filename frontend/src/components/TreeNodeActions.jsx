export default function TreeNodeActions({
    isFolder,
    isRoot,
    adding,
    onToggleAdd,
    onDelete,
}) {
    return (
        <div className="tree-node-actions">
            {isFolder && (
                <button
                    type="button"
                    className="tree-action-btn"
                    title="Добавить элемент"
                    onClick={onToggleAdd}
                >
                    {adding ? "✕" : "＋"}
                </button>
            )}
            {!isRoot && (
                <button
                    type="button"
                    className="tree-action-btn tree-action-danger"
                    title="Удалить"
                    onClick={onDelete}
                >
                    🗑
                </button>
            )}
        </div>
    );
}
