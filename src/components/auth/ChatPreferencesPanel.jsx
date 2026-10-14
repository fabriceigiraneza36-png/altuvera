import React, { useEffect, useState } from "react";
import { SlidersHorizontal, X, Check, Palette } from "lucide-react";

const THEMES = [
  { id: "emerald", label: "Altuvera green", color: "#059669", surface: "#f8fafc" },
  { id: "ocean", label: "Ocean blue", color: "#0284c7", surface: "#f0f9ff" },
  { id: "midnight", label: "Midnight", color: "#6478ee", surface: "#0d1729" },
  { id: "rose", label: "Rose", color: "#e11d48", surface: "#fff1f2" },
];
export default function ChatPreferencesPanel({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const update = (key, selected) => {
    setSaveError("");
    setDraft((current) => ({ theme: selected }));
  };
  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSave({ theme: draft.theme });
      setOpen(false);
    } catch (error) {
      setSaveError(error.message || "Could not sync your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        aria-label="Customize chat appearance" title="Customize chat"
        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        <SlidersHorizontal size={16} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="chat-preferences-title"
            className="flex w-full min-h-0 max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl"
            style={{ height: "min(88dvh, 720px)", maxHeight: "88dvh" }}>
            <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">Your space</p>
                <h2 id="chat-preferences-title" className="mt-1 text-lg font-bold text-slate-900">Chat appearance</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close settings"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={18}/></button>
            </header>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
              <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Palette size={16} className="text-emerald-600"/> Color theme</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {THEMES.map((theme) => {
                    const active = draft.theme === theme.id;
                    return <button type="button" key={theme.id} onClick={() => update("theme", theme.id)}
                      aria-pressed={active}
                      className={`rounded-2xl border p-2.5 text-left transition ${active ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="mb-2 flex h-8 items-center gap-1 rounded-lg p-1.5" style={{background:theme.surface}}>
                        <span className="h-4 w-4 rounded-full" style={{background:theme.color}}/>
                        <span className="h-1.5 w-8 rounded-full" style={{background:theme.color,opacity:.35}}/>
                        <span className="ml-auto h-3 w-3 rounded-full border border-white" style={{background:theme.color}}/>
                      </span>
                      <span className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-700">{theme.label}{active && <Check size={13} className="text-emerald-600"/>}</span>
                    </button>;
                  })}
                </div>
              </section>
            </div>
            {saveError && <p role="alert" className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:mx-6">{saveError}</p>}
            <footer className="flex flex-shrink-0 gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setDraft(value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Reset</button>
              <button type="button" onClick={save} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
                {saving ? "Saving…" : <><Check size={15}/> Save preferences</>}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
