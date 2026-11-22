'use client';

import React, { useState } from 'react';
import { extractSheetId } from '@/lib/sheetParsers';

interface SheetConfigModalProps {
  isOpen: boolean;
  currentSheetId: string;
  currentDriveId: string;
  currentApiKey?: string;
  onClose: () => void;
  onSave: (config: { sheetId: string; driveFolderId: string; apiKey?: string }) => Promise<void>;
}

export default function SheetConfigModal({
  isOpen,
  currentSheetId,
  currentDriveId,
  currentApiKey = '',
  onClose,
  onSave,
}: SheetConfigModalProps) {
  const [sheetInput, setSheetInput] = useState(currentSheetId);
  const [driveInput, setDriveInput] = useState(currentDriveId);
  const [apiInput, setApiInput] = useState(currentApiKey);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanSheetId = extractSheetId(sheetInput);

    await onSave({
      sheetId: cleanSheetId,
      driveFolderId: driveInput.trim(),
      apiKey: apiInput.trim(),
    });

    setSaving(false);
    onClose();
  };

  return (
    <div
      id="sheetConfigModal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-hud"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-slate-950 border border-indigo-400/70 p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <div className="text-[10px] font-hud font-bold tracking-widest text-amber-300 uppercase">
              DYNAMIC DATA SOURCE
            </div>
            <div className="font-hud text-xl font-bold text-white leading-tight">
              Google Sheet ID / API Config
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-hud">
          <div>
            <label className="block text-xs text-slate-300 uppercase mb-1">
              Google Sheet ID or Full Sheet URL
            </label>
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="Paste Google Sheet URL or ID..."
              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 uppercase mb-1">
              Google API Key (Optional Override)
            </label>
            <input
              type="password"
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              placeholder="AIzaSy... (Uses Service Account if blank)"
              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 uppercase mb-1">
              Google Drive Logos Folder ID
            </label>
            <input
              type="text"
              value={driveInput}
              onChange={(e) => setDriveInput(e.target.value)}
              placeholder="1osOfwQDzyZFg_Ma0brO6UNYjd8JfvxxW..."
              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-xs text-emerald-300">
              ● Switches entire tournament feed live
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#F5B700] hover:bg-amber-400 text-black font-hud text-sm font-bold cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Switch Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
