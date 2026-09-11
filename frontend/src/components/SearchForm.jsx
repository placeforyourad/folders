import { useState } from "react";
import * as api from "../api/items";

function SearchForm({ onResult }) {
    const [query, setQuery] = useState("");

    function handleChange(e) {
        const value = e.target.value;
        setQuery(value);
        if (!value) {
            onResult(undefined);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = query.trim();

        if (!trimmed) {
            onResult(undefined);
            return;
        }

        const data = await api.searchItems(trimmed);
        onResult({ tree: data.results });
    }

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <input
                type="search"
                placeholder="Поиск по названию…"
                value={query}
                onChange={handleChange}
                className="search-input"
            />
            <button type="submit" className="search-button">
                Найти
            </button>
        </form>
    );
}

export { SearchForm as default };
