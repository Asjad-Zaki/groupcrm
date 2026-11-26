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
  Plus,
  Landmark,
  ShieldAlert,
  Zap,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  // Counts for category badges
  const municipalityCount = portalsList.filter(
    (p) => p.category === "municipalities",
  ).length;
  const civilDefenceCount = portalsList.filter(
    (p) => p.category === "civil_defence",
  ).length;
  const utilityCount = portalsList.filter(
    (p) => p.category === "utilities",
  ).length;
  const developerCount = portalsList.filter(
    (p) => p.category === "developers",
  ).length;

  const getCompanyBadge = (comp: string) => {
    switch (comp) {
      case "goldland":
        return (
          <span
            key={comp}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30"
          >
            GL · Goldland
          </span>
        );
      case "abbadi":
        return (
          <span
            key={comp}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30"
          >
            AT · Abbadi Tech
          </span>
        );
      case "casavera":
        return (
          <span
            key={comp}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
          >
            CV · Casavera
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryTheme = (category: AuthorityPortal["category"]) => {
    switch (category) {
      case "civil_defence":
        return {
          badge: "bg-rose-500/15 text-rose-500 border-rose-500/30",
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
          label: "Civil Defence",
        };
      case "utilities":
        return {
          badge: "bg-blue-500/15 text-blue-500 border-blue-500/30",
          icon: <Zap className="w-4 h-4 text-blue-500" />,
          label: "Utilities & Power",
        };
      case "developers":
        return {
          badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
          icon: <Building2 className="w-4 h-4 text-emerald-500" />,
          label: "Master Developer",
        };
      case "municipalities":
      default:
        return {
          badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
          icon: <Landmark className="w-4 h-4 text-amber-500" />,
          label: "Municipality",
        };
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            UAE Authority Shortcuts Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick-launch directory for governmental permitting, civil defense,
            utility sanctions, and master developer portals.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Portal Shortcut
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" /> Total Portals
              </span>
              <p className="text-2xl font-black">{portalsList.length}</p>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> 100% Verified
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-500" />{" "}
                Municipalities
              </span>
              <p className="text-2xl font-black text-amber-500">
                {municipalityCount}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20"
            >
              DM · DDA · Trakhees
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" /> Power & Utilities
              </span>
              <p className="text-2xl font-black text-blue-500">
                {utilityCount}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              DEWA · Empower
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Civil
                Defence
              </span>
              <p className="text-2xl font-black text-emerald-500">24/7 Smart</p>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            >
              DCD Life Safety
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Security Compliance Notice Banner */}
      <Card className="p-3.5 border-amber-500/30 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <strong className="text-foreground block text-xs mb-0.5">
            Security & Regulatory Compliance Notice (Rule 11)
          </strong>
          <span className="text-muted-foreground text-[11px] leading-relaxed">
            Per UAE data protection and cybersecurity guidelines, governmental
            login credentials, passwords, and UAE Pass PINs are{" "}
            <strong className="text-foreground">never stored</strong> in this
            CRM. Always sign in directly on the official authority portal via
            corporate UAE Pass or verified consultant credentials.
          </span>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="p-3 border-border/60 bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by authority or acronym (e.g. DM, DEWA, DCD, DDA, Trakhees)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Operating Entity Switcher */}
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border overflow-x-auto">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                companyFilter === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCompanyFilter("all")}
            >
              All Entities
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                companyFilter === "goldland"
                  ? "bg-amber-500 text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCompanyFilter("goldland")}
            >
              Goldland (GL)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                companyFilter === "abbadi"
                  ? "bg-blue-500 text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCompanyFilter("abbadi")}
            >
              Abbadi Tech (AT)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                companyFilter === "casavera"
                  ? "bg-emerald-500 text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCompanyFilter("casavera")}
            >
              Casavera (CV)
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-border/50">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === "all"
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setCategoryFilter("all")}
          >
            All Portals ({portalsList.length})
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              categoryFilter === "municipalities"
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setCategoryFilter("municipalities")}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Municipalities ({municipalityCount})</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              categoryFilter === "civil_defence"
                ? "bg-rose-500/20 text-rose-500 border border-rose-500/30 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setCategoryFilter("civil_defence")}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Civil Defence ({civilDefenceCount})</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              categoryFilter === "utilities"
                ? "bg-blue-500/20 text-blue-500 border border-blue-500/30 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setCategoryFilter("utilities")}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Utilities ({utilityCount})</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              categoryFilter === "developers"
                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setCategoryFilter("developers")}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Master Developers ({developerCount})</span>
          </button>
        </div>
      </Card>

      {/* Portals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortals.map((portal) => {
          const isFavorite = favorites.includes(portal.id);
          const isExpanded = expandedPortalId === portal.id;
          const theme = getCategoryTheme(portal.category);

          return (
            <Card
              key={portal.id}
              className={`border transition-all flex flex-col justify-between ${
                isFavorite
                  ? "border-amber-500/50 bg-card shadow-md"
                  : "border-border/60 bg-card hover:border-primary/40 shadow-xs"
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  {/* Card Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Acronym Badge */}
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${theme.badge}`}
                      >
                        {portal.acronym}
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground text-sm leading-snug">
                          {portal.name}
                        </h3>
                        {/* Entity Badges */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {portal.operating_companies.map((c) =>
                            getCompanyBadge(c),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Favorite Star Button */}
                    <button
                      type="button"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isFavorite
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                      }`}
                      onClick={() => handleToggleFavorite(portal.id)}
                      title={isFavorite ? "Unpin from favorites" : "Pin to top"}
                    >
                      <Star
                        className={`w-4 h-4 ${isFavorite ? "fill-amber-500" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Portal Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                    {portal.description}
                  </p>

                  {/* Contact Hotline & Working Hours */}
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-1 gap-1.5 text-[11px] text-muted-foreground">
                    {portal.contact_hotline && (
                      <div className="flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {portal.contact_hotline}
                        </span>
                      </div>
                    )}
                    {portal.working_hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{portal.working_hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedPortalId(isExpanded ? null : portal.id)
                      }
                    >
                      <FileCheck className="w-3.5 h-3.5 text-primary" />
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
                        className="text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        Open Portal
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>

                  {/* Collapsible Guidelines Drawer */}
                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-3 animate-in fade-in duration-150">
                      <div>
                        <span className="font-bold text-primary uppercase tracking-wider text-[10px] block mb-1">
                          Required Documents Checklist
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                          {portal.required_documents.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block mb-1">
                          Consultant Submission Guidelines
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                          {portal.submission_guidelines.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
