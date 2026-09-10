async function request(url, options) {
    let res;

    try {
        res = await fetch(url, options);
    } catch {
        throw new Error("Сеть недоступна");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка запроса");
    return data;
}

function getTree() {
    return request("/api/tree");
}

function getChildren(id) {
    return request(`/api/tree/${id}/children`);
}

function searchItems(query) {
    return request(`/api/tree/search?query=${encodeURIComponent(query)}`);
}

function createItem({ name, type, parentId }) {
    return request("/api/tree/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, parentId }),
    });
}

function deleteItem(id) {
    return request(`/api/tree/item/${id}`, { method: "DELETE" });
}

export { getTree, getChildren, searchItems, createItem, deleteItem };
