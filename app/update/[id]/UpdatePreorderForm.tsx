"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updatePreorder } from "@/app/actions";

interface Preorder {
  id: string;
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: Date;
  endsAt: Date | null;
  status: boolean;
}

export default function UpdatePreorderForm({ preorder }: { preorder: Preorder }) {
  const router = useRouter();

  // Helper to format Date to YYYY-MM-DDTHH:MM string
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Form states pre-filled with existing preorder values
  const [name, setName] = useState(preorder.name);
  const [products, setProducts] = useState(preorder.products);
  const [preorderWhen, setPreorderWhen] = useState(preorder.preorderWhen);
  const [startsAt, setStartsAt] = useState(() => formatDateForInput(preorder.startsAt));
  const [endsAt, setEndsAt] = useState(() => formatDateForInput(preorder.endsAt));
  const [status, setStatus] = useState(preorder.status);

  // Loading & error states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updatePreorder(preorder.id, {
        name: name.trim(),
        products: Number(products),
        preorderWhen,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        status,
      });

      // Redirect to list page
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to update preorder:", err);
      setError("Failed to update preorder. Please check your inputs and try again.");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          id="btn-back"
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 font-semibold rounded-lg text-xs transition-all shadow-sm"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            id="btn-cancel-top"
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 font-semibold rounded-lg text-xs transition-all shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            id="btn-save-top"
            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] text-white hover:bg-zinc-800 font-semibold rounded-lg text-xs transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            <span>{isSaving ? "Saving..." : "Save changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-zinc-100 bg-white">
          <h2 className="text-sm font-bold text-zinc-900">Preorder details</h2>
          <p className="text-zinc-400 text-[11px] mt-1">These values appear in the preorders list.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-8 mt-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Form Body - Table layout rows */}
        <div className="flex flex-col">
          {/* Row 1: Name */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 border-b border-zinc-100 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-name" className="text-xs font-bold text-zinc-800">
                Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                A label to recognize this preorder by.
              </span>
            </div>
            <div>
              <input
                type="text"
                id="preorder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                disabled={isSaving}
                className="w-full max-w-md px-3 py-1.5 text-xs border border-zinc-200 text-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Products */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 border-b border-zinc-100 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-products" className="text-xs font-bold text-zinc-800">
                Products
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                Number of products covered by this preorder.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="preorder-products"
                value={products}
                onChange={(e) => setProducts(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                required
                disabled={isSaving}
                className="w-24 px-3 py-1.5 text-xs border border-zinc-200 text-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 transition-all text-left"
              />
              <span className="text-xs text-zinc-500 font-medium select-none">product(s)</span>
            </div>
          </div>

          {/* Row 3: Preorder When */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 border-b border-zinc-100 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-when" className="text-xs font-bold text-zinc-800">
                Preorder when
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                When customers are allowed to preorder.
              </span>
            </div>
            <div>
              <select
                id="preorder-when"
                value={preorderWhen}
                onChange={(e) => setPreorderWhen(e.target.value)}
                disabled={isSaving}
                className="w-full max-w-md px-3 py-1.5 text-xs border border-zinc-200 text-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 bg-white cursor-pointer transition-all"
              >
                <option value="regardless-of-stock">regardless-of-stock</option>
                <option value="out-of-stock">out-of-stock</option>
              </select>
            </div>
          </div>

          {/* Row 4: Starts At */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 border-b border-zinc-100 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-starts-at" className="text-xs font-bold text-zinc-800">
                Starts at
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                When the preorder window opens.
              </span>
            </div>
            <div>
              <input
                type="datetime-local"
                id="preorder-starts-at"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                disabled={isSaving}
                className="w-full max-w-md px-3 py-1.5 text-xs border border-zinc-200 text-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 transition-all text-zinc-700 font-mono"
              />
            </div>
          </div>

          {/* Row 5: Ends At */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 border-b border-zinc-100 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-ends-at" className="text-xs font-bold text-zinc-800">
                Ends at
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                Leave empty for no end date.
              </span>
            </div>
            <div>
              <input
                type="datetime-local"
                id="preorder-ends-at"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={isSaving}
                className="w-full max-w-md px-3 py-1.5 text-xs border border-zinc-200 text-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 transition-all text-zinc-700 font-mono"
              />
            </div>
          </div>

          {/* Row 6: Status */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 px-8 py-5 items-start">
            <div className="flex flex-col">
              <label htmlFor="preorder-status" className="text-xs font-bold text-zinc-800">
                Status
              </label>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                Active preorders are visible to customers.
              </span>
            </div>
            <div className="flex items-center gap-2 py-1">
              <button
                type="button"
                id="preorder-status"
                onClick={() => setStatus(!status)}
                disabled={isSaving}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${status ? "bg-zinc-900" : "bg-zinc-200"
                  } ${isSaving ? "opacity-55 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
              <span className="text-xs text-zinc-500 font-medium select-none">Active</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-zinc-50/50">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            id="btn-cancel-bottom"
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 font-semibold rounded-lg text-xs transition-all shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            id="btn-save-bottom"
            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] text-white hover:bg-zinc-800 font-semibold rounded-lg text-xs transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            <span>{isSaving ? "Saving..." : "Save changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
