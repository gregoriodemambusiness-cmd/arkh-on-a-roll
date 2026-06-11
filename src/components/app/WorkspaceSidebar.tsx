"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { useWorkspaces, deleteWorkspace } from "@/lib/workspaces";
import { cn } from "@/lib/utils";

// Cycling palette — each workspace gets a distinct color
const PALETTE = [
  { bg: "bg-brand/15",              text: "text-brand",                    dot: "bg-brand" },
  { bg: "bg-violet-500/15",         text: "text-violet-500",               dot: "bg-violet-500" },
  { bg: "bg-emerald-500/15",        text: "text-emerald-500",              dot: "bg-emerald-500" },
  { bg: "bg-amber-500/15",          text: "text-amber-500",                dot: "bg-amber-500" },
  { bg: "bg-rose-500/15",           text: "text-rose-500",                 dot: "bg-rose-500" },
  { bg: "bg-sky-500/15",            text: "text-sky-500",                  dot: "bg-sky-500" },
];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

interface Props {
  collapsed?: boolean;
}

export function WorkspaceSidebarPanel({ collapsed = false }: Props) {
  const { workspaces, active, loading, activate, add } = useWorkspaces();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    await add(newName.trim());
    setNewName("");
    setCreating(false);
    setSaving(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteWorkspace(id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className={cn("border-b border-border px-3 py-3", collapsed && "px-2")}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("border-b border-border pb-2", collapsed ? "px-2" : "px-2.5")}>
      {/* Section label */}
      {!collapsed && (
        <div className="px-2 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Progetti
        </div>
      )}
      {collapsed && <div className="pt-2" />}

      {/* Workspace list */}
      <div className="space-y-0.5">
        {workspaces.map((ws, i) => {
          const color = colorFor(i);
          const isActive = ws.id === active?.id;
          const initials = ws.name.slice(0, 2).toUpperCase();

          return (
            <motion.button
              key={ws.id}
              onClick={() => activate(ws.id)}
              layout
              className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                isActive
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                  color.bg,
                  color.text,
                )}
              >
                {initials}
              </div>

              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {ws.name}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color.dot)} />
                  )}

                  {/* Delete (hover only, non-active) */}
                  {!isActive && (
                    <button
                      onClick={(e) => handleDelete(ws.id, e)}
                      className="hidden rounded p-0.5 text-muted-foreground/50 hover:text-destructive group-hover:flex"
                      aria-label="Elimina workspace"
                    >
                      {deletingId === ws.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />}
                    </button>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Nuovo progetto */}
      <AnimatePresence mode="wait">
        {creating ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mt-1 overflow-hidden"
          >
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setCreating(false)}
              placeholder="Nome progetto…"
              className="mb-1 w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
            />
            <div className="flex gap-1">
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="flex-1 rounded-lg bg-foreground py-1.5 text-[12px] font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : "Crea"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex-1 rounded-lg border border-border py-1.5 text-[12px] text-muted-foreground hover:bg-accent"
              >
                Annulla
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCreating(true)}
            className={cn(
              "mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-muted-foreground/60 transition hover:bg-accent hover:text-muted-foreground",
              collapsed && "justify-center",
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && "Nuovo progetto"}
          </motion.button>
        )}
      </AnimatePresence>

      {collapsed && <div className="pb-1" />}
    </div>
  );
}

// Legacy export kept for any remaining imports
export { WorkspaceSidebarPanel as WorkspaceSwitcher };
