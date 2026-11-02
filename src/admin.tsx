import { useEffect, useState } from "react";
import { Button, Surface, Textarea } from "@cloudflare/kumo";
import { apiFetch, parseApiResponse } from "@emdash-cms/admin";
import { MEDIA_LIST_QUERY, mediaMetadataPayload } from "./plugin.ts";

type Item = { id: string; filename: string; url: string; alt: string | null; caption: string | null };
type Result = { items: Item[]; nextCursor?: string | null };
type Row = Item & { savedAlt: string; savedCaption: string; saving?: boolean; error?: string; message?: string };

function MediaEditor() {
	const [rows, setRows] = useState<Row[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [initial, setInitial] = useState(true);

	async function load(next?: string) {
		setBusy(true);
		setError("");
		try {
			const params = new URLSearchParams(MEDIA_LIST_QUERY);
			if (next) params.set("cursor", next);
			const res = await apiFetch(`/_emdash/api/media?${params}`);
			const data = await parseApiResponse<Result>(res, "Could not load media.");
			const added = data.items.map((item) => ({
				...item,
				savedAlt: item.alt ?? "",
				savedCaption: item.caption ?? "",
			}));
			setRows((previous) =>
				next ? [...previous, ...added.filter((item) => !previous.some((row) => row.id === item.id))] : added,
			);
			setCursor(data.nextCursor ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load media.");
		} finally {
			setBusy(false);
			setInitial(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	function patch(id: string, change: Partial<Row>) {
		setRows((current) => current.map((row) => (row.id === id ? { ...row, ...change } : row)));
	}

	async function save(row: Row) {
		const body = mediaMetadataPayload(row);
		patch(row.id, { saving: true, error: "", message: "" });
		try {
			const res = await apiFetch(`/_emdash/api/media/${encodeURIComponent(row.id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			await parseApiResponse(res, "Could not save.");
			patch(row.id, { saving: false, savedAlt: body.alt, savedCaption: body.caption, message: "Saved" });
		} catch (err) {
			patch(row.id, { saving: false, error: err instanceof Error ? err.message : "Could not save." });
		}
	}

	return (
		<main style={{ maxWidth: 1440, padding: "24px 0" }}>
			<h1 style={{ fontSize: 24, fontWeight: 650, margin: "0 0 8px" }}>Media Text Editor</h1>
			<p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 24px" }}>
				Edit alt text and captions on this page. Save each image separately. Filenames and files are not changed.
			</p>
			{error && <p role="alert">{error}</p>}
			{initial && <p>Loading…</p>}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 430px), 1fr))",
					gap: 16,
					alignItems: "start",
				}}
			>
				{rows.map((row) => {
					const dirty = (row.alt ?? "") !== row.savedAlt || (row.caption ?? "") !== row.savedCaption;
					return (
						<Surface key={row.id} className="rounded-xl border border-kumo-line p-4" style={{ minWidth: 0 }}>
							<div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
								<img
									src={row.url}
									alt={row.savedAlt}
									loading="lazy"
									style={{
										width: 112,
										height: 90,
										objectFit: "contain",
										borderRadius: 6,
										background: "#eee",
										flexShrink: 0,
									}}
								/>
								<div style={{ minWidth: 0, flex: 1 }}>
									<p title={row.filename} style={{ overflowWrap: "anywhere", fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>
										{row.filename}
									</p>
									<label style={{ display: "block", marginBottom: 10, fontSize: 13, fontWeight: 500 }}>
										Alt text
										<Textarea
											style={{ display: "block", width: "100%", marginTop: 4, minHeight: 60 }}
											rows={2}
											value={row.alt ?? ""}
											disabled={row.saving}
											onChange={(event) => patch(row.id, { alt: event.target.value, message: "" })}
										/>
									</label>
									<label style={{ display: "block", marginBottom: 12, fontSize: 13, fontWeight: 500 }}>
										Caption
										<Textarea
											style={{ display: "block", width: "100%", marginTop: 4, minHeight: 60 }}
											rows={2}
											value={row.caption ?? ""}
											disabled={row.saving}
											onChange={(event) => patch(row.id, { caption: event.target.value, message: "" })}
										/>
									</label>
									<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
										<Button variant="primary" type="button" disabled={row.saving || !dirty} onClick={() => void save(row)}>
											{row.saving ? "Saving…" : "Save"}
										</Button>
										{row.message && (
											<span role="status" style={{ fontSize: 13 }}>
												{row.message}
											</span>
										)}
										{dirty && !row.saving && <span style={{ fontSize: 13, opacity: 0.7 }}>Unsaved</span>}
									</div>
									{row.error && (
										<p role="alert" style={{ color: "#b42318", fontSize: 13 }}>
											{row.error}
										</p>
									)}
								</div>
							</div>
						</Surface>
					);
				})}
			</div>
			{!initial && rows.length === 0 && !error && <p>No images.</p>}
			{cursor && (
				<div style={{ marginTop: 20 }}>
					<Button type="button" disabled={busy} onClick={() => void load(cursor)}>
						{busy ? "Loading…" : "Load more"}
					</Button>
				</div>
			)}
		</main>
	);
}

export const pages = { "/edit": MediaEditor };
