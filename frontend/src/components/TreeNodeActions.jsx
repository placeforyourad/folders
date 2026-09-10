function TreeNodeActions({ isFolder, isRoot, isAdding, onToggleAdd, onDelete }) {
    return (
        <div className="tree-node-actions">
            {isFolder && (
                <button
                    type="button"
                    className="tree-action-btn"
                    title={isAdding ? "Скрыть поле" :"Добавить элемент"}
                    onClick={onToggleAdd}
                >
                    {isAdding ? "✕" : "＋"}
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

export { TreeNodeActions as default };
