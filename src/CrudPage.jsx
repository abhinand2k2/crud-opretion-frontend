import { useEffect, useMemo, useState } from "react";

const BASE = "http://localhost:8080/api";

export default function CrudPage({ section }) {
    const { api, label, singular, fields } = section;
    const url = `${BASE}/${api}`;
    const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));

    const [rows, setRows] = useState([]);
    const [draft, setDraft] = useState(blank);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            setRows(await res.json());
            setError("");
        } catch {
            setError("Can't reach the server. Start the Spring Boot app on port 8080, then reload.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Turn form text into what the API expects (numbers stay numbers).
    const body = (row) =>
        Object.fromEntries(
            fields.map((f) => {
                const v = row[f.key] ?? "";
                return [f.key, f.type === "number" ? (v === "" ? null : Number(v)) : v];
            })
        );

    const send = async (target, method, payload) => {
        const res = await fetch(target, {
            method,
            headers: { "Content-Type": "application/json" },
            body: payload && JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
    };

    const run = async (action) => {
        try {
            await action();
            await load();
        } catch {
            setError("That change didn't save. Check the backend console, then try again.");
        }
    };

    const add = (e) => {
        e.preventDefault();
        run(async () => {
            await send(url, "POST", body(draft));
            setDraft(blank);
        });
    };

    const save = (e) => {
        e.preventDefault();
        run(async () => {
            await send(`${url}/${editing.id}`, "PUT", body(editing));
            setEditing(null);
        });
    };

    const remove = (row) => {
        if (window.confirm(`Delete this ${singular}: "${row.name}"?`)) {
            run(() => send(`${url}/${row.id}`, "DELETE"));
        }
    };

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => fields.map((f) => r[f.key] ?? "").join(" ").toLowerCase().includes(q));
    }, [rows, query, fields]);

    const field = (f, form, value, onChange, aria) => (
        <input
            form={form}
            type={f.type ?? "text"}
            step={f.type === "number" ? "any" : undefined}
            min={f.type === "number" ? 0 : undefined}
            aria-label={aria}
            placeholder={f.label}
            value={value ?? ""}
            onChange={onChange}
            required={f.required}
        />
    );

    return (
        <main className="wrap">
            <form id="add-form" onSubmit={add} />
            <form id="edit-form" onSubmit={save} />

            <header className="top">
                <div>
                    <h1>{label}</h1>
                    <p className="count">
                        {loading ? `Loading ${label.toLowerCase()}…` : `${rows.length} ${singular}${rows.length === 1 ? "" : "s"} saved`}
                    </p>
                </div>
                <input
                    className="search"
                    type="search"
                    aria-label={`Search ${label.toLowerCase()}`}
                    placeholder={`Search ${label.toLowerCase()}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </header>

            {error && (
                <p className="alert" role="alert">
                    {error}
                </p>
            )}

            <div className="sheet">
                <table>
                    <thead>
                    <tr>
                        {fields.map((f) => (
                            <th key={f.key} scope="col">
                                {f.label}
                            </th>
                        ))}
                        <th scope="col">
                            <span className="sr">Actions</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="add-row">
                        {fields.map((f) => (
                            <td key={f.key}>
                                {field(f, "add-form", draft[f.key], (e) => setDraft({ ...draft, [f.key]: e.target.value }), `New ${singular} ${f.label.toLowerCase()}`)}
                            </td>
                        ))}
                        <td className="actions">
                            <button className="btn" type="submit" form="add-form">
                                Add {singular}
                            </button>
                        </td>
                    </tr>

                    {shown.map((row) =>
                        editing?.id === row.id ? (
                            <tr key={`edit-${row.id}`}>
                                {fields.map((f) => (
                                    <td key={f.key}>
                                        {field(f, "edit-form", editing[f.key], (e) => setEditing({ ...editing, [f.key]: e.target.value }), `${f.label}`)}
                                    </td>
                                ))}
                                <td className="actions">
                                    <button className="btn" type="submit" form="edit-form">
                                        Save {singular}
                                    </button>
                                    <button className="btn quiet" type="button" onClick={() => setEditing(null)}>
                                        Cancel edit
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={`row-${row.id}`}>
                                {fields.map((f, i) => (
                                    <td key={f.key} className={i === 0 ? "name" : "desc"}>
                                        {row[f.key]}
                                    </td>
                                ))}
                                <td className="actions">
                                    <button
                                        className="btn quiet"
                                        type="button"
                                        aria-label={`Edit ${row.name}`}
                                        onClick={() =>
                                            setEditing({ ...row, ...Object.fromEntries(fields.map((f) => [f.key, row[f.key] ?? ""])) })
                                        }
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn quiet danger"
                                        type="button"
                                        aria-label={`Delete ${row.name}`}
                                        onClick={() => remove(row)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )
                    )}

                    {!loading && !error && shown.length === 0 && (
                        <tr>
                            <td colSpan={fields.length + 1} className="empty">
                                {rows.length === 0
                                    ? `No ${label.toLowerCase()} yet. Add the first one in the row above.`
                                    : `No ${label.toLowerCase()} match "${query}". Clear the search to see all.`}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}