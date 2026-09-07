import { useState } from "react";
import { searchItems } from "../api/items";

export default function SearchForm({ onResult }) {
    const [query, setQuery] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = query.trim();

        if (!trimmed) {
            onResult(undefined);
            return;
        }

        const data = await searchItems(trimmed);
        onResult({ tree: data.results });
    }

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <input
                type="search"
                placeholder="Поиск по названию…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            <button type="submit" className="search-button">
                Найти
            </button>
        </form>
    );
}
