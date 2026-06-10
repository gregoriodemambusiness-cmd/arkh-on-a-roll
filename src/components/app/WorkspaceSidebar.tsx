"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, FolderOpen, Check, Loader2 } from "lucide-react";
import { useWorkspaces } from "@/lib/workspaces";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSidebarProps) {
  const { workspaces, active, loading, activate, add } = useWorkspaces();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    await add(newName.trim());
    setNewName("");
    setCreating(false);
    setSaving(false);
    setOpen(false);
  };

  const displayName = active?.name ?? "Workspace";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className={cn("flex h-11 items-center gap-2 px-3", collapsed && "justify-center")}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        {!collapsed && <span className="text-[12.5px] text-muted-foreground">Caricamento…</span>}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-accent",
          open && "bg-accent",
          collapsed && "justify-center",
        )}
      >
        {/* Workspace avatar */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-[11px] font-bold text-brand">
          {initials}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold leading-tight">
                {displayName}
              </div>
              <div className="text-[10.5px] text-muted-foreground">
                {workspaces.length} workspace
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-1 min-w-[200px] rounded-xl border border-border bg-card shadow-elegant",
              collapsed ? "left-full ml-2 top-0" : "left-0 right-0",
            )}
          >
            {/* Workspace list */}
            <div className="max-h-52 overflow-y-auto p-1">
              {workspaces.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                  Nessun workspace ancora
                </div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { activate(ws.id); setOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-accent"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand/12 text-[10px] font-bold text-brand">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium">{ws.name}</div>
                      <div className="text-[10.5px] text-muted-foreground">
                        {new Date(ws.created_at).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    {ws.id === active?.id && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Divider */}
            <div className="mx-2 border-t border-border" />

            {/* Create new */}
            <div className="p-1">
              {creating ? (
                <form onSubmit={handleCreate} className="px-1 py-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome workspace…"
                    className="mb-1.5 w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
                  />
                  <div className="flex gap-1.5">
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
                </form>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nuovo workspace
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-width workspace panel for the sidebar (shows workspaces as a list below the switcher).
 *  Designed to be placed at the top of AppSidebar. */
export function WorkspaceSidebarPanel({ collapsed = false }: WorkspaceSidebarProps) {
  return (
    <div
      className={cn(
        "border-b border-border px-3 pb-3 pt-2",
        collapsed && "px-2",
      )}
    >
      <WorkspaceSwitcher collapsed={collapsed} />
    </div>
  );
}
