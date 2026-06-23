"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowUpDown, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown 
} from "lucide-react";
import { togglePreorderStatus, deletePreorder } from "@/app/actions";
import { ClientFormattedDate } from "./ClientFormattedDate";

interface Preorder {
  id: string;
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: Date;
  endsAt: Date | null;
  status: boolean;
  createdAt: Date;
}

interface PreordersClientProps {
  preorders: Preorder[];
  totalCount: number;
  currentFilter: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  currentPage: number;
  pageSize: number;
}

export default function PreordersClient({
  preorders,
  totalCount,
  currentFilter,
  currentSortBy,
  currentSortOrder,
  currentPage,
  pageSize,
}: PreordersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI state for sort dropdown
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Status toggle loading states to prevent double click and show feedback
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update query parameters in the URL
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    router.push(`?${params.toString()}`);
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = preorders.map((p) => p.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const updated = new Set(selectedIds);
    if (checked) {
      updated.add(id);
    } else {
      updated.delete(id);
    }
    setSelectedIds(updated);
  };

  const allSelected = preorders.length > 0 && preorders.every((p) => selectedIds.has(p.id));

  // Toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (updatingIds.has(id)) return;
    
    // Optimistically update
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await togglePreorderStatus(id, !currentStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Delete preorder
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      try {
        await deletePreorder(id);
        // Clear from selected
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error("Failed to delete preorder:", error);
        alert("Failed to delete preorder. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-8 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#18181b] tracking-tight">Preorders</h1>
        <button
          onClick={() => router.push("/create")}
          id="btn-create-preorder"
          className="px-4 py-2 bg-[#18181b] text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
        >
          Create Preorder
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-visible">
        {/* Card Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {["all", "active", "inactive"].map((filterOpt) => {
              const isActive = currentFilter === filterOpt;
              return (
                <button
                  key={filterOpt}
                  id={`tab-filter-${filterOpt}`}
                  onClick={() => updateParams({ filter: filterOpt, page: 1 })}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-bold"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  {filterOpt}
                </button>
              );
            })}
          </div>

          {/* Sort Button and Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              id="btn-sort-toggle"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              <ArrowUpDown size={15} />
            </button>

            {/* Sort Dropdown Popover */}
            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 py-2.5 flex flex-col text-xs text-zinc-700 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 pb-1 text-zinc-400 font-semibold tracking-wider uppercase text-[10px]">
                  Sort by
                </div>

                {/* Sort Fields */}
                {[
                  { label: "Name", value: "name" },
                  { label: "Created At", value: "createdAt" },
                  { label: "Starts At", value: "startsAt" },
                  { label: "Ends At", value: "endsAt" },
                ].map((field) => {
                  const isSelected = currentSortBy === field.value;
                  return (
                    <button
                      key={field.value}
                      id={`sort-field-${field.value}`}
                      onClick={() => {
                        updateParams({ sortBy: field.value });
                        setIsSortOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-50 text-left w-full transition-colors"
                    >
                      <span>{field.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? "border-zinc-900 bg-white" : "border-zinc-300 bg-white"
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                      </span>
                    </button>
                  );
                })}

                <div className="border-t border-zinc-100 my-2"></div>

                {/* Direction Options */}
                {[
                  { label: "Ascending", value: "asc", icon: <ArrowUp size={13} /> },
                  { label: "Descending", value: "desc", icon: <ArrowDown size={13} /> },
                ].map((dir) => {
                  const isSelected = currentSortOrder === dir.value;
                  return (
                    <button
                      key={dir.value}
                      id={`sort-order-${dir.value}`}
                      onClick={() => {
                        updateParams({ sortOrder: dir.value });
                        setIsSortOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors ${
                        isSelected ? "bg-zinc-100 text-zinc-950 font-medium" : "hover:bg-zinc-50 text-zinc-600"
                      }`}
                    >
                      {dir.icon}
                      <span>{dir.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 select-none bg-zinc-50/50">
                <th className="pl-6 py-3 w-12">
                  <input
                    type="checkbox"
                    id="checkbox-select-all"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-offset-0 cursor-pointer accent-zinc-900"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-center">Products</th>
                <th className="px-4 py-3 font-medium">Preorder when</th>
                <th className="px-4 py-3 font-medium">Starts at</th>
                <th className="px-4 py-3 font-medium">Ends at</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="pr-6 py-3 font-medium text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {preorders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-zinc-400">
                    No preorders found matching current filters.
                  </td>
                </tr>
              ) : (
                preorders.map((preorder) => {
                  const isSelected = selectedIds.has(preorder.id);
                  const isUpdating = updatingIds.has(preorder.id);
                  const isDeleting = deletingId === preorder.id;

                  return (
                    <tr
                      key={preorder.id}
                      className={`border-b border-zinc-100/80 text-xs text-zinc-700 hover:bg-zinc-50/40 transition-colors ${
                        isSelected ? "bg-zinc-50/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="pl-6 py-3.5">
                        <input
                          type="checkbox"
                          id={`checkbox-select-${preorder.id}`}
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(preorder.id, e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-offset-0 cursor-pointer accent-zinc-900"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5 font-bold text-zinc-900">
                        {preorder.name}
                      </td>

                      {/* Products count */}
                      <td className="px-4 py-3.5 text-center font-medium">
                        {preorder.products}
                      </td>

                      {/* Preorder When */}
                      <td className="px-4 py-3.5 text-zinc-500 font-mono text-[11px]">
                        {preorder.preorderWhen}
                      </td>

                      {/* Starts At */}
                      <td className="px-4 py-3.5 text-zinc-600 font-medium">
                        <ClientFormattedDate date={preorder.startsAt} />
                      </td>

                      {/* Ends At */}
                      <td className="px-4 py-3.5 text-zinc-600 font-medium">
                        {preorder.endsAt ? (
                          <ClientFormattedDate date={preorder.endsAt} />
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          id={`status-toggle-${preorder.id}`}
                          onClick={() => handleToggleStatus(preorder.id, preorder.status)}
                          disabled={isUpdating}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            preorder.status ? "bg-zinc-900" : "bg-zinc-200"
                          } ${isUpdating ? "opacity-55 cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              preorder.status ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="pr-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-edit-${preorder.id}`}
                            onClick={() => router.push(`/update/${preorder.id}`)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                            title="Edit preorder"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            id={`btn-delete-${preorder.id}`}
                            onClick={() => handleDelete(preorder.id, preorder.name)}
                            disabled={isDeleting}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete preorder"
                          >
                            <Trash2 size={14} className={isDeleting ? "animate-pulse" : ""} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer / Pagination */}
        <div className="flex items-center justify-center gap-4 py-3 bg-zinc-50/80 border-t border-zinc-100 rounded-b-2xl select-none">
          <button
            id="btn-pagination-prev"
            onClick={() => updateParams({ page: currentPage - 1 })}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="text-xs font-semibold text-zinc-700">
            Showing {startRange} to {endRange} from {totalCount}
          </div>

          <button
            id="btn-pagination-next"
            onClick={() => updateParams({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="p-1 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
