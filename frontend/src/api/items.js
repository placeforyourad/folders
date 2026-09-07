async function request(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка запроса");
    return data;
}

export function getTree() {
    return request("/api/tree");
}

export function getChildren(id) {
    return request(`/api/tree/${id}/children`);
}

export function searchItems(query) {
    return request(`/api/tree/search?query=${encodeURIComponent(query)}`);
}

export function createItem({ name, type, parentId }) {
    return request("/api/tree/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, parentId }),
    });
}

export function deleteItem(id) {
    return request(`/api/tree/item/${id}`, { method: "DELETE" });
}
