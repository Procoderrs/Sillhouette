"use client";

import { useEffect, useState } from "react";

const field =
	"border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black";
const btn =
	"border border-black px-3 py-1.5 text-[12px] uppercase tracking-[0.12em] disabled:opacity-50";

function Badge({ children, tone }) {
	const tones = {
		nav: "bg-black text-white",
		sale: "bg-sale text-white",
		hidden: "bg-neutral-300 text-neutral-800",
	};
	return (
		<span
			className={`mr-1 inline-block px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${tones[tone]}`}
		>
			{children}
		</span>
	);
}

export default function CollectionsManager() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	const [parentName, setParentName] = useState("");
	const [parentNav, setParentNav] = useState(true);
	const [parentSale, setParentSale] = useState(false);
	const [childNames, setChildNames] = useState({});

	const parents = items.filter((c) => c.type === "parent");
	const childrenOf = (parent) =>
		items.filter((c) => c.type === "child" && c.parent === parent.slug);

	async function load() {
		setLoading(true);
		try {
			const res = await fetch("/api/admin/collections", { cache: "no-store" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Collections load nahi hue");
			setItems(data.data);
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	// Ek hi function: create, update aur delete sab isi se jata hai
	async function send(url, method, body) {
		setBusy(true);
		setError("");
		try {
			const res = await fetch(url, {
				method,
				headers: body ? { "Content-Type": "application/json" } : undefined,
				body: body ? JSON.stringify(body) : undefined,
			});
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				const firstFieldError = data.errors && Object.values(data.errors)[0];
				setError(firstFieldError || data.message || "Kuch ghalat hua");
				return false;
			}

			await load();
			return true;
		} catch {
			setError("Server se connect nahi ho saka");
			return false;
		} finally {
			setBusy(false);
		}
	}

	async function addParent(e) {
		e.preventDefault();
		const ok = await send("/api/admin/collections", "POST", {
			name: parentName,
			type: "parent",
			order: parents.length + 1,
			showInNav: parentNav,
			isSale: parentSale,
			isActive: true,
		});
		if (ok) {
			setParentName("");
			setParentSale(false);
		}
	}

	async function addChild(e, parent) {
		e.preventDefault();
		const name = childNames[parent.slug] || "";
		const ok = await send("/api/admin/collections", "POST", {
			name,
			type: "child",
			parent: parent.slug,
			order: childrenOf(parent).length + 1,
			showInNav: false,
			isSale: false,
			isActive: true,
		});
		if (ok) setChildNames((prev) => ({ ...prev, [parent.slug]: "" }));
	}

	// PATCH mein poori values bhejni hoti hain, sirf ek flag ulta jata hai
	function toggle(item, key) {
		return send(`/api/admin/collections/${item._id}`, "PATCH", {
			name: item.name,
			type: item.type,
			parent: item.parent,
			order: item.order,
			showInNav: item.showInNav,
			isSale: item.isSale,
			isActive: item.isActive,
			[key]: !item[key],
		});
	}

	function remove(item) {
		if (!window.confirm(`"${item.name}" delete karein?`)) return;
		send(`/api/admin/collections/${item._id}`, "DELETE");
	}

	return (
		<div className="space-y-8">
			{error && <p className="text-[14px] text-sale">{error}</p>}

			{/* ADD PARENT */}
			<section className="space-y-4 border border-line bg-white p-6">
				<h2 className="text-[16px] uppercase tracking-[0.15em]">Add parent</h2>
				<form onSubmit={addParent} className="flex flex-wrap items-end gap-4">
					<div>
						<label className="mb-1 block text-[12px] uppercase tracking-[0.12em]">
							Parent name
						</label>
						<input
							className={field}
							value={parentName}
							onChange={(e) => setParentName(e.target.value)}
							placeholder="e.g. Formal"
						/>
					</div>
					<label className="flex items-center gap-2 text-[14px]">
						<input
							type="checkbox"
							checked={parentNav}
							onChange={(e) => setParentNav(e.target.checked)}
						/>
						Show in header
					</label>
					<label className="flex items-center gap-2 text-[14px]">
						<input
							type="checkbox"
							checked={parentSale}
							onChange={(e) => setParentSale(e.target.checked)}
						/>
						Sale collection
					</label>
					<button
						type="submit"
						disabled={busy || !parentName.trim()}
						className={btn}
					>
						Add parent
					</button>
				</form>
			</section>

			{/* LIST */}
			{loading && <p className="text-[14px] text-neutral-500">Loading...</p>}
			{!loading && parents.length === 0 && (
				<p className="text-[14px] text-neutral-500">
					Abhi koi collection nahi hai
				</p>
			)}

			{parents.map((p) => (
				<section
					key={p._id}
					className="space-y-4 border border-line bg-white p-6"
				>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="text-[16px] uppercase tracking-[0.12em]">
								{p.name}
							</p>
							<p className="text-[12px] text-neutral-500">/{p.slug}</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							{p.showInNav && <Badge tone="nav">Header</Badge>}
							{p.isSale && <Badge tone="sale">Sale</Badge>}
							{!p.isActive && <Badge tone="hidden">Hidden</Badge>}
							<button
								type="button"
								disabled={busy}
								onClick={() => toggle(p, "showInNav")}
								className={btn}
							>
								{p.showInNav ? "Hide from header" : "Show in header"}
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => toggle(p, "isSale")}
								className={btn}
							>
								{p.isSale ? "Unset sale" : "Set as sale"}
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => toggle(p, "isActive")}
								className={btn}
							>
								{p.isActive ? "Deactivate" : "Activate"}
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => remove(p)}
								className={btn}
							>
								Delete
							</button>
						</div>
					</div>

					{/* CHILDREN */}
					<div className="space-y-2 border-t border-line pt-4">
						{childrenOf(p).length === 0 && (
							<p className="text-[13px] text-neutral-500">Koi child nahi hai</p>
						)}
						{childrenOf(p).map((c) => (
							<div
								key={c._id}
								className="flex flex-wrap items-center justify-between gap-2 bg-soft-2 px-3 py-2"
							>
								<p className="text-[14px]">
									{c.name}{" "}
									<span className="text-[12px] text-neutral-500">
										/{c.slug}
									</span>
									{!c.isActive && (
										<span className="ml-2">
											<Badge tone="hidden">Hidden</Badge>
										</span>
									)}
								</p>
								<div className="flex gap-2">
									<button
										type="button"
										disabled={busy}
										onClick={() => toggle(c, "isActive")}
										className={btn}
									>
										{c.isActive ? "Deactivate" : "Activate"}
									</button>
									<button
										type="button"
										disabled={busy}
										onClick={() => remove(c)}
										className={btn}
									>
										Delete
									</button>
								</div>
							</div>
						))}

						<form
							onSubmit={(e) => addChild(e, p)}
							className="flex flex-wrap items-end gap-3 pt-2"
						>
							<input
								className={field}
								placeholder="Child name, e.g. Meeras"
								value={childNames[p.slug] || ""}
								onChange={(e) =>
									setChildNames((prev) => ({
										...prev,
										[p.slug]: e.target.value,
									}))
								}
							/>
							<button
								type="submit"
								disabled={busy || !(childNames[p.slug] || "").trim()}
								className={btn}
							>
								Add child
							</button>
						</form>
					</div>
				</section>
			))}
		</div>
	);
}
