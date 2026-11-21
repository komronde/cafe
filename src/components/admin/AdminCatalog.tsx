"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { adminFetch, card, ErrorNote, Modal, PageHeader, Spinner, Toggle, useAdminList } from "@/components/admin/shared";
import { formatUZS } from "@/lib/format";

type Cat = { id: number; slug: string; name: string; description: string; sortOrder: number; productCount: number };
type Prod = {
  id: number;
  name: string;
  description: string;
  priceUzs: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
};

const EMPTY = { id: 0, name: "", description: "", priceUzs: 0, imageUrl: "", available: true, featured: false, categoryId: 0 };

export function AdminProducts() {
  const products = useAdminList<Prod>("products");
  const cats = useAdminList<Cat>("categories");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState(0);
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.items.filter((p) => (!catFilter || p.categoryId === catFilter) && (!s || p.name.toLowerCase().includes(s)));
  }, [products.items, q, catFilter]);

  function openNew() {
    setFormErr("");
    setEditing({ ...EMPTY, categoryId: cats.items[0]?.id ?? 0 });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormErr("");
    try {
      await adminFetch("products", { method: editing.id ? "PUT" : "POST", body: editing });
      setEditing(null);
      await products.reload();
      await cats.reload();
    } catch (er) {
      setFormErr(er instanceof Error ? er.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setFormErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed");
      setEditing((p) => (p ? { ...p, imageUrl: d.url } : p));
    } catch (er) {
      setFormErr(er instanceof Error ? er.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function toggleAvailable(p: Prod) {
    try {
      await adminFetch("products", { method: "PUT", body: { ...p, available: !p.available } });
      await products.reload();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  async function remove(p: Prod) {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try {
      await adminFetch("products", { method: "DELETE", query: `?id=${p.id}` });
      await products.reload();
      await cats.reload();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader
        title="Menu products"
        sub={`${products.items.length} products across ${cats.items.length} categories.`}
        action={<button type="button" onClick={openNew} className="btn btn-primary btn-sm"><Plus size={14} /> Add product</button>}
      />
      <ErrorNote message={products.error || err} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-72">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mocha/50" />
          <input className="input !rounded-full !pl-10" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </div>
        <select className="input !w-auto !rounded-full" value={catFilter} onChange={(e) => setCatFilter(Number(e.target.value))} aria-label="Filter by category">
          <option value={0}>All categories</option>
          {cats.items.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {products.loading ? (
        <Spinner />
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-sand text-xs uppercase tracking-widest text-mocha/60">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {shown.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-12 w-12 flex-none rounded-xl object-cover" /> : <span className="h-12 w-12 flex-none rounded-xl bg-sand" />}
                      <div>
                        <p className="font-semibold">{p.name}{p.featured && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-caramel-dark">Featured</span>}</p>
                        <p className="line-clamp-1 max-w-xs text-xs text-mocha/60">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{p.categoryName}</td>
                  <td className="p-4 whitespace-nowrap">{formatUZS(p.priceUzs)}</td>
                  <td className="p-4"><Toggle checked={p.available} onChange={() => toggleAvailable(p)} label={p.available ? "In stock" : "Sold out"} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => { setFormErr(""); setEditing({ id: p.id, name: p.name, description: p.description, priceUzs: p.priceUzs, imageUrl: p.imageUrl, available: p.available, featured: p.featured, categoryId: p.categoryId }); }} className="grid h-9 w-9 place-items-center rounded-full bg-white transition hover:bg-cream-dark" aria-label={`Edit ${p.name}`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => remove(p)} className="grid h-9 w-9 place-items-center rounded-full text-mocha/50 transition hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${p.name}`}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-mocha/60">No products match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit product" : "New product"}>
        {editing && (
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="pr-name">Name</label>
                <input id="pr-name" className="input" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="pr-cat">Category</label>
                <select id="pr-cat" className="input" required value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: Number(e.target.value) })}>
                  {cats.items.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="pr-price">Price (UZS)</label>
                <input id="pr-price" className="input" required type="number" min={0} step={500} value={editing.priceUzs} onChange={(e) => setEditing({ ...editing, priceUzs: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="pr-desc">Description</label>
                <textarea id="pr-desc" className="input min-h-24 resize-none" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>

            <div>
              <span className="label">Image</span>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {editing.imageUrl ? <img src={editing.imageUrl} alt="Preview" className="h-24 w-24 flex-none rounded-2xl object-cover" /> : <span className="grid h-24 w-24 flex-none place-items-center rounded-2xl bg-sand text-mocha/50"><ImagePlus /></span>}
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-ghost btn-sm">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Upload image
                  </button>
                  <input className="input !py-2 text-sm" placeholder="…or paste an image URL" value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} aria-label="Image URL" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              <Toggle checked={editing.available} onChange={(v) => setEditing({ ...editing, available: v })} label="Available" />
              <Toggle checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Featured on homepage" />
            </div>

            <ErrorNote message={formErr} />
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" disabled={busy || uploading} className="btn btn-primary btn-sm">{busy && <Loader2 size={14} className="animate-spin" />} Save product</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export function AdminCategories() {
  const { items, loading, error, reload } = useAdminList<Cat>("categories");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Cat | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await adminFetch("categories", { method: "POST", body: { name, description } });
      setName("");
      setDescription("");
      await reload();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await adminFetch("categories", { method: "PUT", body: editing });
      setEditing(null);
      await reload();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  async function remove(c: Cat) {
    if (!confirm(`Delete category “${c.name}”?`)) return;
    setErr("");
    try {
      await adminFetch("categories", { method: "DELETE", query: `?id=${c.id}` });
      await reload();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  return (
    <>
      <PageHeader title="Categories" sub="Organise your menu. Lower sort numbers appear first." />
      <ErrorNote message={error || err} />
      <form onSubmit={add} className={`${card} mb-6 flex flex-col gap-3 p-5 md:flex-row md:items-end`}>
        <div className="flex-1">
          <label className="label" htmlFor="cat-name">New category</label>
          <input id="cat-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smoothies" />
        </div>
        <div className="flex-[2]">
          <label className="label" htmlFor="cat-desc">Description</label>
          <input id="cat-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" />
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm !py-3.5"><Plus size={14} /> Add</button>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <li key={c.id} className={`${card} p-5`}>
              {editing?.id === c.id ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input className="input" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} aria-label="Category name" />
                  <input className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} aria-label="Description" />
                  <input className="input" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} aria-label="Sort order" />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-3xl font-semibold">{c.name}</p>
                      <p className="text-xs text-mocha/60">{c.productCount} products · order {c.sortOrder}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditing(c)} className="grid h-9 w-9 place-items-center rounded-full bg-white hover:bg-cream-dark" aria-label={`Edit ${c.name}`}><Pencil size={14} /></button>
                      <button type="button" onClick={() => remove(c)} className="grid h-9 w-9 place-items-center rounded-full text-mocha/50 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${c.name}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {c.description && <p className="mt-2 text-sm text-mocha/70">{c.description}</p>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
