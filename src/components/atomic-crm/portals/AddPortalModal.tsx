import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthorityPortal } from "./types";

interface AddPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (portal: AuthorityPortal) => void;
}

export const AddPortalModal = ({ isOpen, onClose, onAdd }: AddPortalModalProps) => {
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<AuthorityPortal["category"]>("municipalities");
  const [description, setDescription] = useState("");
  const [hotline, setHotline] = useState("");
  const [hours, setHours] = useState("");
  const [companies, setCompanies] = useState<Array<"goldland" | "abbadi" | "casavera">>([
    "goldland",
  ]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleToggleCompany = (c: "goldland" | "abbadi" | "casavera") => {
    setCompanies((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !acronym.trim()) {
      setError("Please fill in Portal Name, Acronym, and URL.");
      return;
    }

    if (companies.length === 0) {
      setError("Please select at least one relevant operating entity.");
      return;
    }

    const newPortal: AuthorityPortal = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      acronym: acronym.trim().toUpperCase(),
      url: url.trim(),
      category,
      description: description.trim() || "UAE Authority Submission & Online Services Portal.",
      operating_companies: companies,
      submission_guidelines: [
        "Ensure all drawings have valid consultant registration seals.",
        "Sign and stamp appointment letters before online submission.",
      ],
      required_documents: [
        "Architectural & Engineering Drawings",
        "Valid Trade License and Affection Plan",
      ],
      contact_hotline: hotline.trim() || undefined,
      working_hours: hours.trim() || "Mon – Thu: 07:30 AM – 03:30 PM",
    };

    onAdd(newPortal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full shadow-2xl p-6">
        <div className="flex items-center gap-3 text-amber-400 mb-4 pb-3 border-b border-slate-800">
          <PlusCircle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white">Add Authority Portal Shortcut</h3>
            <p className="text-xs text-slate-400">Configure quick-access link for team submissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Portal Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dubai Civil Defence Portal"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Acronym <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DCD"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Official Portal URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="municipalities">Municipalities</option>
                <option value="civil_defence">Civil Defence</option>
                <option value="utilities">Utilities</option>
                <option value="developers">Developers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Support Hotline</label>
              <input
                type="text"
                placeholder="e.g. 800 900"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Hours</label>
              <input
                type="text"
                placeholder="e.g. 07:30 – 15:30"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Services</label>
            <textarea
              rows={2}
              placeholder="Key services covered by this authority portal..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Relevant Operating Entities
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  companies.includes("goldland")
                    ? "bg-amber-950 text-amber-300 border-amber-600"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
                onClick={() => handleToggleCompany("goldland")}
              >
                GL • Goldland
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  companies.includes("abbadi")
                    ? "bg-blue-950 text-blue-300 border-blue-600"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
                onClick={() => handleToggleCompany("abbadi")}
              >
                AT • Abbadi Tech
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  companies.includes("casavera")
                    ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
                onClick={() => handleToggleCompany("casavera")}
              >
                CV • Casavera
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs"
            >
              Save Portal Shortcut
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
