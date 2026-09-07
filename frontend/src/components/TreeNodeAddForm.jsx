import { useState } from "react";

export default function TreeNodeAddForm({ onSubmit, onCancel }) {
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("folder");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newName.trim()) return;
        await onSubmit({ name: newName, type: newType });
        setNewName("");
        setNewType("folder");
    }

    function handleKeyDown(e) {
        if (e.key === "Escape") onCancel();
    }

    return (
        <form
            className="tree-add-form"
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
        >
            <input
                className="tree-add-input"
                placeholder="Название"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
            />
            <select
                className="tree-add-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
            >
                <option value="folder">Папка</option>
                <option value="file">Файл</option>
            </select>
            <button type="submit" className="tree-add-submit">
                Добавить
            </button>
            <button
                type="button"
                className="tree-add-cancel"
                onClick={onCancel}
            >
                Отмена
            </button>
        </form>
    );
}
