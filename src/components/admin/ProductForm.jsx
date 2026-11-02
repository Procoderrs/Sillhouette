"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { buildVariantSku } from "@/lib/sku";

const MAX_IMAGES = 2;

const field =
	"w-full border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black";
const label = "mb-1 block text-[12px] uppercase tracking-[0.12em]";
const smallBtn =
	"border border-black px-3 py-2 text-[12px] uppercase tracking-[0.12em] disabled:opacity-50";

function uid() {
	return Math.random().toString(36).slice(2, 10);
}

// Sirf "Size" option SKU mein jata hai
function isSizeOption(name) {
	return name.trim().toLowerCase() === "size";
}

// Attributes ka unique key, taake regenerate hone par purana data wapas mil jaye
function comboKey(attrs) {
	return [...(attrs ?? [])]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((a) => `${a.name}=${a.value}`)
		.join("|");
}
function cartesian(groups) {
	return groups.reduce(
		(acc, g) =>
			acc.flatMap((combo) =>
				g.values.map((v) => [...combo, { name: g.name, value: v }]),
			),
		[[]],
	);
}

function generateRows(options, existing) {
	const groups = options.map((o) => ({
		name: o.name.trim(),
		values: o.values,
	}));
	const combos = groups.length ? cartesian(groups) : [[]];
	const previous = new Map(existing.map((r) => [r.key, r]));

	return combos.map((attributes) => {
		const key = comboKey(attributes);
		const old = previous.get(key);
		return {
			key,
			attributes,
			price: old?.price ?? "",
			salePrice: old?.salePrice ?? "",
			stock: old?.stock ?? "",
		};
	});
}

function attrText(r) {
	return r.attributes.map((a) => a.value).join(" / ") || "Default";
}

function toFormValues(p) {
	const images = [...(p.images || [])];
	while (images.length < MAX_IMAGES) images.push("");

	return {
		name: p.name ?? "",
		sku: p.sku ?? "",
		description: p.description ?? "",
		parentCollection: p.collection ?? "",
		childCollection: p.childCollection ?? "",
		onSale: Boolean(p.onSale),
		saleNote: p.saleNote ?? "",
		color: p.color ?? "",
		style: p.style ?? "",
		isActive: p.isActive ?? true,
		isNew: Boolean(p.isNew),
		expressAllowed: p.expressAllowed ?? true,
		images: images.slice(0, MAX_IMAGES),
		sizeChartImage: p.sizeChartImage ?? "",
		unstitchedDetails: p.unstitchedDetails ?? "",
		readyMadeDetails: p.readyMadeDetails ?? "",
	};
}

const EMPTY_FORM = toFormValues({});

function toOptions(p) {
	return (p.options ?? []).map((o) => ({
		id: uid(),
		name: o.name,
		values: o.values,
	}));
}

function toChoiceGroups(p) {
	return (p.choiceGroups ?? []).map((g) => ({
		id: uid(),
		title: g.title,
		choices: g.choices,
	}));
}

function toRows(p) {
	return (p.variants ?? []).map((v) => {
		const attributes = v.attributes ?? [];
		return {
			key: comboKey(attributes),
			attributes,
			price: v.price == null ? "" : String(v.price),
			salePrice: v.salePrice == null ? "" : String(v.salePrice),
			stock: v.stock == null ? "" : String(v.stock),
		};
	});
}

function Section({ title, children }) {
	return (
		<section className="space-y-5 border border-line bg-white p-6">
			<h2 className="text-[16px] uppercase tracking-[0.15em]">{title}</h2>
			{children}
		</section>
	);
}

function Toggle({ checked, onChange, title, hint }) {
	return (
		<div className="flex items-center justify-between border border-line bg-soft-2 px-4 py-3">
			<div>
				<p className="text-[14px]">{title}</p>
				{hint && <p className="text-[12px] text-neutral-500">{hint}</p>}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative h-6 w-11 rounded-full transition ${
					checked ? "bg-black" : "bg-neutral-300"
				}`}
			>
				<span
					className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
						checked ? "left-5" : "left-0.5"
					}`}
				/>
			</button>
		</div>
	);
}

function FieldError({ message }) {
	return message ? (
		<p className="mt-1 text-[12px] text-sale">{message}</p>
	) : null;
}

export default function ProductForm({ product, productId }) {
	const router = useRouter();
	const isEdit = Boolean(productId);

	const [form, setForm] = useState(() =>
		product ? toFormValues(product) : EMPTY_FORM,
	);
	const [options, setOptions] = useState(() =>
		product ? toOptions(product) : [],
	);
	const [valueDrafts, setValueDrafts] = useState({});
	const [rows, setRows] = useState(() => (product ? toRows(product) : []));
	const [choiceGroups, setChoiceGroups] = useState(() =>
		product ? toChoiceGroups(product) : [],
	);
	const [choiceDrafts, setChoiceDrafts] = useState({});
	const [collections, setCollections] = useState([]);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState("");
	const [serverErrors, setServerErrors] = useState({});

	const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

	const slug = form.name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	useEffect(() => {
		let cancelled = false;

		async function loadCollections() {
			try {
				const res = await fetch("/api/admin/collections", {
					cache: "no-store",
				});
				const data = await res.json();
				if (!res.ok)
					throw new Error(data.message || "Collections could not be loaded");
				if (!cancelled) setCollections(data.data);
			} catch (err) {
				if (!cancelled) setFormError(err.message);
			}
		}

		loadCollections();
		return () => {
			cancelled = true;
		};
	}, []);

	const activeCollections = collections.filter((c) => c.isActive);
	const parentOptions = activeCollections
		.filter((c) => c.type === "parent")
		.map((c) => ({ value: c.slug, label: c.name }));
	const childOptions = activeCollections
		.filter((c) => c.type === "child" && c.parent === form.parentCollection)
		.map((c) => ({ value: c.slug, label: c.name }));

	useEffect(() => {
		if (isEdit || parentOptions.length === 0) return;
		if (!parentOptions.some((o) => o.value === form.parentCollection)) {
			setForm((prev) => ({
				...prev,
				parentCollection: parentOptions[0].value,
				childCollection: "",
			}));
		}
	}, [parentOptions, form.parentCollection, isEdit]);

	// ---------- Variant options (Size, Dupatta, etc.) ----------
	function addOption() {
		setOptions((prev) => [...prev, { id: uid(), name: "", values: [] }]);
	}

	function updateOptionName(id, name) {
		setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, name } : o)));
	}

	function removeOption(id) {
		setOptions((prev) => prev.filter((o) => o.id !== id));
	}

	function addValue(id) {
		const value = (valueDrafts[id] ?? "").trim();
		if (!value) return;

		setOptions((prev) =>
			prev.map((o) =>
				o.id === id &&
				!o.values.some((v) => v.toLowerCase() === value.toLowerCase())
					? { ...o, values: [...o.values, value] }
					: o,
			),
		);
		setValueDrafts((prev) => ({ ...prev, [id]: "" }));
	}

	function removeValue(id, value) {
		setOptions((prev) =>
			prev.map((o) =>
				o.id === id ? { ...o, values: o.values.filter((v) => v !== value) } : o,
			),
		);
	}

	// ---------- Choice groups (You may also add, etc.) ----------
	function addChoiceGroup() {
		setChoiceGroups((prev) => [...prev, { id: uid(), title: "", choices: [] }]);
	}

	function updateGroupTitle(id, title) {
		setChoiceGroups((prev) =>
			prev.map((g) => (g.id === id ? { ...g, title } : g)),
		);
	}

	function removeChoiceGroup(id) {
		setChoiceGroups((prev) => prev.filter((g) => g.id !== id));
	}

	function addChoice(id) {
		const value = (choiceDrafts[id] ?? "").trim();
		if (!value) return;

		setChoiceGroups((prev) =>
			prev.map((g) =>
				g.id === id &&
				!g.choices.some((c) => c.toLowerCase() === value.toLowerCase())
					? { ...g, choices: [...g.choices, value] }
					: g,
			),
		);
		setChoiceDrafts((prev) => ({ ...prev, [id]: "" }));
	}

	function removeChoice(id, value) {
		setChoiceGroups((prev) =>
			prev.map((g) =>
				g.id === id
					? { ...g, choices: g.choices.filter((c) => c !== value) }
					: g,
			),
		);
	}

	// ---------- Variants ----------
	const optionsForSave = options.map((o) => ({
		name: o.name.trim(),
		useInSku: isSizeOption(o.name),
		values: o.values,
	}));

	function generate() {
		const incomplete = options.some(
			(o) => !o.name.trim() || o.values.length === 0,
		);
		if (incomplete) {
			setFormError("Every option needs a name and at least one value");
			return;
		}
		setFormError("");
		setRows(generateRows(options, rows));
	}

	function updateRow(key, fieldName, value) {
		setRows((prev) =>
			prev.map((r) => (r.key === key ? { ...r, [fieldName]: value } : r)),
		);
	}

	function removeRow(key) {
		setRows((prev) => prev.filter((r) => r.key !== key));
	}

	function rowError(r) {
		if (r.price === "" || Number(r.price) <= 0) return "Price is required";
		if (form.onSale) {
			if (r.salePrice === "") return "Sale price is required";
			if (Number(r.salePrice) >= Number(r.price))
				return "Sale price must be less than price";
		}
		return "";
	}

	function serverRowError(i) {
		const key = Object.keys(serverErrors).find((k) =>
			k.startsWith(`variants.${i}.`),
		);
		return key ? serverErrors[key] : "";
	}

	// ---------- Submit ----------
	async function handleSubmit() {
		setFormError("");
		setServerErrors({});

		if (!form.name.trim() || !form.sku.trim()) {
			setFormError("Product name and base SKU are required");
			return;
		}
		if (rows.length === 0) {
			setFormError("Click Generate variants first");
			return;
		}
		if (rows.some((r) => rowError(r))) {
			setFormError("Please fix the variant errors");
			return;
		}
		if (choiceGroups.some((g) => !g.title.trim() || g.choices.length === 0)) {
			setFormError("Every choice group needs a title and at least one choice");
			return;
		}

		const payload = {
			name: form.name.trim(),
			sku: form.sku.trim(),
			description: form.description.trim(),
			collection: form.parentCollection,
			childCollection: form.childCollection || "",
			color: form.color.trim(),
			style: form.style.trim(),
			images: form.images.map((u) => u.trim()).filter(Boolean),
			sizeChartImage: form.sizeChartImage.trim(),
			unstitchedDetails: form.unstitchedDetails.trim(),
			readyMadeDetails: form.readyMadeDetails.trim(),
			onSale: form.onSale,
			saleNote: form.onSale ? form.saleNote.trim() : "",
			isNew: form.isNew,
			isActive: form.isActive,
			expressAllowed: form.expressAllowed,
			options: optionsForSave,
			choiceGroups: choiceGroups.map((g) => ({
				title: g.title.trim(),
				choices: g.choices,
			})),
			variants: rows.map((r) => ({
				attributes: r.attributes,
				price: Number(r.price),
				salePrice:
					form.onSale && r.salePrice !== "" ? Number(r.salePrice) : null,
				stock: Number(r.stock) || 0,
			})),
		};

		setSaving(true);
		try {
			const res = await fetch(
				isEdit ? `/api/admin/products/${productId}` : "/api/admin/products",
				{
					method: isEdit ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setServerErrors(data.errors || {});
				setFormError(data.message || "Product could not be saved");
				return;
			}

			router.push("/admin/products");
			router.refresh();
		} catch {
			setFormError("Could not connect to server");
		} finally {
			setSaving(false);
		}
	}

	const activeCollectionsLoaded = collections.length > 0;

	return (
		<div className="max-w-5xl space-y-8">
			<div>
				<p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
					Admin
				</p>
				<h1 className="mt-1 text-[24px] uppercase tracking-[0.15em]">
					{isEdit ? "Edit product" : "New product"}
				</h1>
			</div>

			{/* BASIC INFO */}
			<Section title="Basic information">
				<div className="grid gap-5 md:grid-cols-2">
					<div>
						<label className={label}>Product name</label>
						<input
							className={field}
							value={form.name}
							onChange={(e) => update("name", e.target.value)}
						/>
						<p className="mt-1 text-[12px] text-neutral-500">
							Slug: {slug || "-"}
						</p>
						<FieldError message={serverErrors.name} />
					</div>

					<div>
						<label className={label}>Base SKU</label>
						<input
							className={field}
							value={form.sku}
							onChange={(e) => update("sku", e.target.value)}
						/>
						<p className="mt-1 text-[12px] text-neutral-500">
							Variant SKU: base + Size code, jaise RM-2-S
						</p>
						<FieldError message={serverErrors.sku} />
					</div>

					<div className="md:col-span-2">
						<label className={label}>Description</label>
						<textarea
							rows={4}
							className={field}
							value={form.description}
							onChange={(e) => update("description", e.target.value)}
						/>
					</div>

					<div>
						<label className={label}>Parent category</label>
						<select
							className={field}
							value={form.parentCollection}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									parentCollection: e.target.value,
									childCollection: "",
								}))
							}
						>
							{parentOptions.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
						<FieldError message={serverErrors.collection} />
					</div>

					<div>
						<label className={label}>Child category</label>
						<select
							className={field}
							value={form.childCollection}
							onChange={(e) => update("childCollection", e.target.value)}
						>
							<option value="">None</option>
							{childOptions.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className={label}>Colour</label>
						<input
							className={field}
							value={form.color}
							onChange={(e) => update("color", e.target.value)}
						/>
					</div>

					<div>
						<label className={label}>Style</label>
						<input
							className={field}
							value={form.style}
							onChange={(e) => update("style", e.target.value)}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Toggle
						title="Sale"
						hint="On karne par sale price aur sale details dikhenge"
						checked={form.onSale}
						onChange={(v) => update("onSale", v)}
					/>
					<Toggle
						title="Active"
						hint="Site par dikhe ga"
						checked={form.isActive}
						onChange={(v) => update("isActive", v)}
					/>
					<Toggle
						title="New badge"
						hint="Card par New likha aayega"
						checked={form.isNew}
						onChange={(v) => update("isNew", v)}
					/>
					<Toggle
						title="Express allowed"
						hint="Express shipping option dikhega"
						checked={form.expressAllowed}
						onChange={(v) => update("expressAllowed", v)}
					/>
				</div>
			</Section>

			{form.onSale && (
				<Section title="Sale details">
					<div>
						<label className={label}>Sale policy note</label>
						<textarea
							rows={2}
							className={field}
							value={form.saleNote}
							onChange={(e) => update("saleNote", e.target.value)}
						/>
					</div>
				</Section>
			)}

			{/* VARIANT OPTIONS */}
			<Section title="Variant options">
				<p className="text-[13px] text-neutral-500">
					These options create variants and can have their own price and stock
					(for example Size, Dupatta). If the option is named "Size", it is also
					included in the SKU.
				</p>

				{options.map((o) => (
					<div key={o.id} className="space-y-3 border border-line p-4">
						<div className="flex flex-wrap items-end gap-4">
							<div className="min-w-[200px] flex-1">
								<label className={label}>Option name</label>
								<input
									className={field}
									value={o.name}
									placeholder="e.g. Size"
									onChange={(e) => updateOptionName(o.id, e.target.value)}
								/>
							</div>
							{isSizeOption(o.name) && (
								<span className="pb-2 text-[12px] text-neutral-500">
									Used in SKU
								</span>
							)}
							<button
								type="button"
								onClick={() => removeOption(o.id)}
								className="text-[12px] underline"
							>
								Remove option
							</button>
						</div>

						<div className="flex flex-wrap gap-2">
							{o.values.map((v) => (
								<span
									key={v}
									className="flex items-center gap-2 border border-neutral-300 px-3 py-1 text-[13px]"
								>
									{v}
									<button
										type="button"
										onClick={() => removeValue(o.id, v)}
										className="text-neutral-500"
									>
										×
									</button>
								</span>
							))}
						</div>

						<div className="flex gap-2">
							<input
								className={field}
								value={valueDrafts[o.id] ?? ""}
								placeholder="Value likhein aur Enter dabayein"
								onChange={(e) =>
									setValueDrafts((prev) => ({
										...prev,
										[o.id]: e.target.value,
									}))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addValue(o.id);
									}
								}}
							/>
							<button
								type="button"
								onClick={() => addValue(o.id)}
								className={smallBtn}
							>
								Add value
							</button>
						</div>
					</div>
				))}

				<button type="button" onClick={addOption} className={smallBtn}>
					Add option
				</button>
			</Section>

			{/* VARIANTS */}
			<Section title="Variants">
				<div className="flex flex-wrap items-center gap-3">
					<button type="button" onClick={generate} className={smallBtn}>
						Generate variants
					</button>
					<button
						type="button"
						onClick={() => setRows([])}
						className={smallBtn}
					>
						Delete variants
					</button>
					<p className="text-[12px] text-neutral-500">
						If you change the options, click Generate again. Existing price and
						stock
					</p>
				</div>

				{rows.length === 0 ? (
					<p className="text-[14px] text-neutral-500">
						No variants yet. Add options and click Generate variants.{" "}
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-[14px]">
							<thead>
								<tr className="border-b text-left text-[12px] uppercase tracking-[0.1em]">
									<th className="py-2 pr-2">Variant</th>
									<th className="py-2 pr-2">SKU</th>
									<th className="py-2 pr-2">Price</th>
									{form.onSale && <th className="py-2 pr-2">Sale price</th>}
									<th className="py-2 pr-2">Stock</th>
									<th className="py-2"></th>
								</tr>
							</thead>
							<tbody>
								{rows.map((r) => (
									<tr key={r.key} className="border-b align-top">
										<td className="py-2 pr-2 text-[13px]">{attrText(r)}</td>
										<td className="py-2 pr-2 text-[13px] text-neutral-600">
											{buildVariantSku(
												form.sku.trim() || "-",
												optionsForSave,
												r.attributes,
											)}
										</td>
										<td className="py-2 pr-2">
											<input
												type="number"
												className={field}
												value={r.price}
												onChange={(e) =>
													updateRow(r.key, "price", e.target.value)
												}
											/>
										</td>
										{form.onSale && (
											<td className="py-2 pr-2">
												<input
													type="number"
													className={field}
													value={r.salePrice}
													onChange={(e) =>
														updateRow(r.key, "salePrice", e.target.value)
													}
												/>
											</td>
										)}
										<td className="py-2 pr-2">
											<input
												type="number"
												className={field}
												value={r.stock}
												onChange={(e) =>
													updateRow(r.key, "stock", e.target.value)
												}
											/>
										</td>
										<td className="py-2">
											<button
												type="button"
												onClick={() => removeRow(r.key)}
												className="text-[13px] underline"
											>
												Remove
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{rows.map((r, i) => {
					const error = rowError(r) || serverRowError(i);
					return error ? (
						<p key={r.key} className="text-[12px] text-sale">
							Row {i + 1} ({attrText(r)}): {error}
						</p>
					) : null;
				})}
			</Section>

			{/* CHOICE GROUPS */}
			<Section title="Customer add-on choices">
				<p className="text-[13px] text-neutral-500">
					These do not create variants and do not change price or stock. The
					customer only picks one choice (for example "You may also add": Slip
					with sleeves,
				</p>

				{choiceGroups.map((g) => (
					<div key={g.id} className="space-y-3 border border-line p-4">
						<div className="flex flex-wrap items-end gap-4">
							<div className="min-w-[200px] flex-1">
								<label className={label}>Group title</label>
								<input
									className={field}
									value={g.title}
									placeholder="e.g. You may also add"
									onChange={(e) => updateGroupTitle(g.id, e.target.value)}
								/>
							</div>
							<button
								type="button"
								onClick={() => removeChoiceGroup(g.id)}
								className="text-[12px] underline"
							>
								Remove group
							</button>
						</div>

						<div className="flex flex-wrap gap-2">
							{g.choices.map((c) => (
								<span
									key={c}
									className="flex items-center gap-2 border border-neutral-300 px-3 py-1 text-[13px]"
								>
									{c}
									<button
										type="button"
										onClick={() => removeChoice(g.id, c)}
										className="text-neutral-500"
									>
										×
									</button>
								</span>
							))}
						</div>

						<div className="flex gap-2">
							<input
								className={field}
								value={choiceDrafts[g.id] ?? ""}
								placeholder="Choice likhein aur Enter dabayein"
								onChange={(e) =>
									setChoiceDrafts((prev) => ({
										...prev,
										[g.id]: e.target.value,
									}))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addChoice(g.id);
									}
								}}
							/>
							<button
								type="button"
								onClick={() => addChoice(g.id)}
								className={smallBtn}
							>
								Add choice
							</button>
						</div>
					</div>
				))}

				<button type="button" onClick={addChoiceGroup} className={smallBtn}>
					Add group
				</button>
			</Section>

			{/* IMAGES */}
			<Section title={`Images (max ${MAX_IMAGES})`}>
				<div className="space-y-5">
					{form.images.slice(0, MAX_IMAGES).map((url, i) => (
						<ImageUploadField
							key={i}
							label={`Image ${i + 1}`}
							value={url}
							onChange={(v) =>
								setForm((prev) => {
									const images = [...prev.images];
									images[i] = v;
									return { ...prev, images };
								})
							}
							error={serverErrors[`images.${i}`]}
						/>
					))}
				</div>
			</Section>

			{/* FABRIC DETAILS */}
			<Section title="Fabric details">
				<div className="grid gap-5 md:grid-cols-2">
					<div>
						<label className={label}>Unstitched details</label>
						<textarea
							rows={6}
							className={field}
							value={form.unstitchedDetails}
							onChange={(e) => update("unstitchedDetails", e.target.value)}
						/>
					</div>
					<div>
						<label className={label}>Ready-made details</label>
						<textarea
							rows={6}
							className={field}
							value={form.readyMadeDetails}
							onChange={(e) => update("readyMadeDetails", e.target.value)}
						/>
					</div>
				</div>
				<p className="text-[12px] text-neutral-500">
					Heading ke aakhir mein : lagayein. List ke liye har line - se shuru
					karein. Sections ke beech khali line chhodein.
				</p>

				<ImageUploadField
					label="Size chart image"
					value={form.sizeChartImage}
					onChange={(v) => update("sizeChartImage", v)}
					error={serverErrors.sizeChartImage}
				/>
			</Section>

			{formError && <p className="text-[14px] text-sale">{formError}</p>}

			<button
				type="button"
				onClick={handleSubmit}
				disabled={saving}
				className="btn-primary w-full disabled:opacity-50"
			>
				{saving ? "Saving..." : isEdit ? "Update product" : "Save product"}
			</button>
		</div>
	);
}
