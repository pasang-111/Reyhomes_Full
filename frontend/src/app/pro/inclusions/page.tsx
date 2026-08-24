"use client";

import { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import {
  getProInclusions,
  addProInclusion,
  updateProInclusion,
  type ClientInclusion,
} from "@/lib/api/pro";

const categoryLabels: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  electrical: "Electrical",
  flooring: "Flooring",
  facade: "Facade",
  living: "Living",
  exterior: "Exterior",
  other: "Other",
};

export default function ProInclusionsPage() {
  const [items, setItems] = useState<ClientInclusion[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCategory, setNewCategory] = useState("kitchen");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function reload() {
    setItems(await getProInclusions());
  }

  useEffect(() => {
    reload().catch((e) => setError(e?.message || "Unable to load inclusions."));
  }, []);

  async function toggle(item: ClientInclusion) {
    try {
      await updateProInclusion(item.id, { selected: !item.selected });
      await reload();
    } catch (e: any) {
      setError(e?.message || "Update failed.");
    }
  }

  async function onAdd() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await addProInclusion({
        category: newCategory,
        title: newTitle.trim(),
        description: "",
        selected: true,
        notes: newNotes.trim(),
      });
      setNewTitle("");
      setNewNotes("");
      setShowAdd(false);
      await reload();
    } catch (e: any) {
      setError(e?.message || "Could not add inclusion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
            Inclusions
          </p>
          <h1 className="mt-2 font-display text-4xl text-white">Your selections</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-[#D8C7A4] px-4 py-2 text-sm font-medium text-[#0A1628]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </header>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {showAdd ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#111820] px-3 py-2 text-sm"
          >
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-white/10 bg-[#111820] px-3 py-2 text-sm"
          />
          <input
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full rounded-xl border border-white/10 bg-[#111820] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={saving}
            onClick={onAdd}
            className="rounded-full bg-[#D8C7A4] px-4 py-2 text-sm font-medium text-[#0A1628]"
          >
            Save inclusion
          </button>
        </div>
      ) : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <button
              type="button"
              onClick={() => toggle(item)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                item.selected
                  ? "border-[#D8C7A4] bg-[#D8C7A4] text-[#0A1628]"
                  : "border-white/20 text-white/30"
              }`}
            >
              {item.selected ? <Check className="h-4 w-4" /> : null}
            </button>
            <div>
              <p className="text-white">{item.title}</p>
              <p className="text-xs text-white/40">
                {categoryLabels[item.category] || item.category}
                {item.notes ? ` · ${item.notes}` : ""}
              </p>
            </div>
          </li>
        ))}
        {!items.length ? (
          <p className="text-sm text-white/40">No inclusions yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
