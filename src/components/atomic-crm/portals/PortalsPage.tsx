import { useState, useMemo } from "react";
import {
  ExternalLink,
  Search,
  Star,
  Building2,
  PhoneCall,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  PlusCircle,
  Landmark,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveTenant } from "@/hooks/useTenant";
import { INITIAL_AUTHORITY_PORTALS } from "./portalData";
import { AddPortalModal } from "./AddPortalModal";
import type { AuthorityPortal, AuthorityCategory } from "./types";

const FAVORITES_STORAGE_KEY = "groupcrm-portal-favorites";

export const PortalsPage = () => {
  const { activeTenantId } = useActiveTenant();

  // Load custom added portals and favorites from localStorage
  const [portalsList, setPortalsList] = useState<AuthorityPortal[]>(() => {
    try {
      const saved = localStorage.getItem("groupcrm-custom-portals");
      if (saved) {
        return [...INITIAL_AUTHORITY_PORTALS, ...JSON.parse(saved)];
      }
    } catch (_e) {
      void _e;
    }
    return INITIAL_AUTHORITY_PORTALS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_e) {
      void _e;
    }
    return ["dm", "dewa", "dcd"]; // default pinned
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<AuthorityCategory>("all");
  const [companyFilter, setCompanyFilter] = useState<string>(
    activeTenantId === "group" ? "all" : activeTenantId,
  );
  const [expandedPortalId, setExpandedPortalId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Toggle favorite
  const handleToggleFavorite = (portalId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(portalId)
        ? prev.filter((id) => id !== portalId)
        : [...prev, portalId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (_e) {
        void _e;
      }
      return next;
    });
  };

  const handleAddCustomPortal = (newPortal: AuthorityPortal) => {
    const updated = [newPortal, ...portalsList];
    setPortalsList(updated);
    try {
      const customOnly = updated.filter((p) => p.id.startsWith("custom_"));
      localStorage.setItem(
        "groupcrm-custom-portals",
        JSON.stringify(customOnly),
      );
    } catch (_e) {
      void _e;
    }
  };

  // Filter and sort portals (favorites first)
  const filteredPortals = useMemo(() => {
    return portalsList
      .filter((portal) => {
        // Category filter
        if (categoryFilter !== "all" && portal.category !== categoryFilter) {
          return false;
        }

        // Operating entity filter
        if (companyFilter !== "all") {
          if (!portal.operating_companies.includes(companyFilter as any)) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = portal.name.toLowerCase().includes(q);
          const matchAcronym = portal.acronym.toLowerCase().includes(q);
          const matchDesc = portal.description.toLowerCase().includes(q);
          return matchName || matchAcronym || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        const isFavA = favorites.includes(a.id);
        const isFavB = favorites.includes(b.id);
        if (isFavA && !isFavB) return -1;
        if (!isFavA && isFavB) return 1;
        return a.acronym.localeCompare(b.acronym);
      });
  }, [portalsList, categoryFilter, companyFilter, searchQuery, favorites]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Governmental &amp; Developer Portals Directory</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            UAE Authority Shortcuts Hub
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dubai Mainland &amp; Freezones
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Quick-launch access to official permitting, engineering, and master
            developer portals for Goldland Contracting, Abbadi Tech, and
            Casavera Interiors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />+ Add Portal
            Shortcut
          </Button>
        </div>
      </div>

      {/* Security Compliance Banner (Rule 11) */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="text-amber-200 block text-xs mb-0.5">
            Security &amp; Regulatory Compliance Notice (Rule 11)
          </strong>
          <span>
            Per UAE data protection and cybersecurity guidelines, governmental
            login credentials, passwords, and UAE Pass PINs are{" "}
            <strong>NEVER stored</strong> in this CRM. Always sign in directly
            on the official portal via corporate UAE Pass or verified
            credentials.
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by authority or acronym (e.g. DM, DEWA, DCD, DDA, Trakhees)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Operating Entity Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              companyFilter === "all"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setCompanyFilter("all")}
          >
            All Entities
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              companyFilter === "goldland"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setCompanyFilter("goldland")}
          >
            Goldland (GL)
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              companyFilter === "abbadi"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setCompanyFilter("abbadi")}
          >
            Abbadi Tech (AT)
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              companyFilter === "casavera"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setCompanyFilter("casavera")}
          >
            Casavera (CV)
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            categoryFilter === "all"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setCategoryFilter("all")}
        >
          All Portals ({portalsList.length})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            categoryFilter === "municipalities"
              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter("municipalities")}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Municipalities &amp; Zoning (4)</span>
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            categoryFilter === "civil_defence"
              ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter("civil_defence")}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Civil Defence &amp; Fire (1)</span>
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            categoryFilter === "utilities"
              ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter("utilities")}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Utilities &amp; Power (2)</span>
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            categoryFilter === "developers"
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter("developers")}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Master Developers &amp; Freezones (3)</span>
        </button>
      </div>

      {/* Portals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPortals.map((portal) => {
          const isFavorite = favorites.includes(portal.id);
          const isExpanded = expandedPortalId === portal.id;

          return (
            <div
              key={portal.id}
              className={`p-5 rounded-2xl border transition-all ${
                isFavorite
                  ? "bg-slate-900 border-amber-600/40 shadow-lg shadow-amber-950/20"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Acronym Badge */}
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                      portal.category === "civil_defence"
                        ? "bg-rose-950/60 text-rose-300 border-rose-700/50"
                        : portal.category === "utilities"
                          ? "bg-blue-950/60 text-blue-300 border-blue-700/50"
                          : portal.category === "developers"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                            : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                    }`}
                  >
                    {portal.acronym}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-sm leading-snug">
                      {portal.name}
                    </h3>
                    {/* Entity Badges */}
                    <div className="flex items-center gap-1 mt-1">
                      {portal.operating_companies.map((c) => (
                        <span
                          key={c}
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            c === "goldland"
                              ? "bg-amber-950 text-amber-300 border-amber-700/50"
                              : c === "abbadi"
                                ? "bg-blue-950 text-blue-300 border-blue-700/50"
                                : "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                          }`}
                        >
                          {c === "goldland"
                            ? "GL"
                            : c === "abbadi"
                              ? "AT"
                              : "CV"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Favorite Star */}
                <button
                  type="button"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isFavorite
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                  }`}
                  onClick={() => handleToggleFavorite(portal.id)}
                  title={isFavorite ? "Unpin from favorites" : "Pin to top"}
                >
                  <Star
                    className={`w-4 h-4 ${isFavorite ? "fill-amber-400" : ""}`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mt-3">
                {portal.description}
              </p>

              {/* Hotline and Hours */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                {portal.contact_hotline && (
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{portal.contact_hotline}</span>
                  </div>
                )}
                {portal.working_hours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{portal.working_hours}</span>
                  </div>
                )}
              </div>

              {/* Expandable Guidelines & Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1 transition-colors"
                  onClick={() =>
                    setExpandedPortalId(isExpanded ? null : portal.id)
                  }
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Submission Checklist
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>

                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                  >
                    Open Portal
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>

              {/* Expanded Guidelines Accordion */}
              {isExpanded && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div>
                    <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                      Required Documents Checklist
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {portal.required_documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                      Consultant Submission Guidelines
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {portal.submission_guidelines.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddPortalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomPortal}
      />
    </div>
  );
};
