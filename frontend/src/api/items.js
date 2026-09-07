export async function getTree() {
    const res = await fetch("/api/tree");
    return res.json();
}

export async function getChildren(id) {
    const res = await fetch(`/api/tree/${id}/children`);
    return res.json();
}

export async function searchItems(query) {
    const res = await fetch(`/api/tree/search?q=${encodeURIComponent(query)}`);
    return res.json();
}

export async function createItem({ name, type, parentId }) {
    const res = await fetch(`/api/tree/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, parentId }),
    });
    return res.json();
}

export async function deleteItem(id) {
    const res = await fetch(`/api/tree/item/${id}`, { method: "DELETE" });
    return res.json();
}
