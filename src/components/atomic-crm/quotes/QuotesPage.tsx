import { useState } from "react";
import { useGetList, useCreate, useUpdate, useNotify } from "ra-core";
import {
  FileText,
  Plus,
  Search,
  Calculator,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateQuoteModal } from "./CreateQuoteModal";
import { QuoteViewModal } from "./QuoteViewModal";
import type { Quotation, Project } from "../types";

export const QuotesPage = () => {
  const notify = useNotify();
  const [create] = useCreate();
  const [update] = useUpdate();

  const [companyFilter, setCompanyFilter] = useState<"all" | "goldland" | "abbadi" | "casavera">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);

  const { data: quotes = [], refetch } = useGetList<Quotation>("quotations", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "DESC" },
  });

  const { data: projects = [] } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "id", order: "ASC" },
  });

  const handleCreateQuote = async (newQuoteData: Omit<Quotation, "id" | "created_at" | "updated_at">) => {
    try {
      await create(
        "quotations",
        {
          data: {
            ...newQuoteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            notify("Quotation generated successfully", { type: "success" });
            refetch();
          },
        }
      );
    } catch {
      notify("Failed to create quotation", { type: "error" });
    }
  };

  const handleStatusChange = async (quote: Quotation, newStatus: Quotation["status"]) => {
    try {
      await update(
        "quotations",
        {
          id: quote.id,
          data: { ...quote, status: newStatus, updated_at: new Date().toISOString() },
          previousData: quote,
        },
        { mutationMode: "optimistic" }
      );
      notify(`Quotation marked as ${newStatus}`, { type: "success" });
      refetch();
      if (viewingQuote && viewingQuote.id === quote.id) {
        setViewingQuote({ ...quote, status: newStatus });
      }
    } catch {
      notify("Failed to update status", { type: "error" });
    }
  };

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  const generateWhatsAppLink = (quote: Quotation) => {
    const cleanPhone = getCleanPhone(quote.client_phone);
    const msg = `*QUOTATION & COMMERCIAL PROPOSAL*\n*${quote.company_name}*\nTRN: ${quote.trn_number}\n----------------------------------------\n*Quotation No:* ${quote.quote_number}\n*Client:* ${quote.client_name} (${quote.client_company})\n*Date:* ${quote.issue_date}\n*Valid Until:* ${quote.valid_until}\n${quote.project_name ? `*Project:* ${quote.project_name}\n` : ""}----------------------------------------\n*Financial Summary:*\n• Subtotal: ${formatAED(quote.subtotal)}\n• UAE VAT (5%): ${formatAED(quote.vat_amount)}\n*Grand Total: ${formatAED(quote.total_amount)}*\n----------------------------------------\nPlease reply to this WhatsApp message to confirm approval or request revisions. Thank you!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Filter quotes
  const filteredQuotes = quotes.filter((q) => {
    if (companyFilter !== "all" && q.operating_company !== companyFilter) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNum = q.quote_number.toLowerCase().includes(query);
      const matchClient = q.client_name.toLowerCase().includes(query);
      const matchComp = q.client_company.toLowerCase().includes(query);
      const matchProj = q.project_name?.toLowerCase().includes(query);
      return matchNum || matchClient || matchComp || matchProj;
    }
    return true;
  });

  // Calculate Metrics
  const totalValue = quotes.reduce((acc, q) => acc + (q.total_amount || 0), 0);
  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  const approvedValue = approvedQuotes.reduce((acc, q) => acc + (q.total_amount || 0), 0);
  const totalVAT = quotes.reduce((acc, q) => acc + (q.vat_amount || 0), 0);
  const sentQuotes = quotes.filter((q) => q.status === "sent");
  const sentValue = sentQuotes.reduce((acc, q) => acc + (q.total_amount || 0), 0);

  const getCompanyBadge = (comp: string) => {
    switch (comp) {
      case "goldland":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">GL · Goldland</span>;
      case "abbadi":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">AT · Abbadi Tech</span>;
      case "casavera":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">CV · Casavera</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Quotation["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Sent to Client
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-400 border-slate-500/20">
            Draft
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            UAE Quotations & BOQ Generator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial proposals with automated 5% UAE VAT, staged milestones, and 1-click WhatsApp dispatch.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Quotation / BOQ
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Total Quotes Pipeline
              </span>
              <p className="text-2xl font-black">{formatAED(totalValue)}</p>
            </div>
            <Badge variant="outline" className="text-xs">{quotes.length} Quotes</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved Contracts
              </span>
              <p className="text-2xl font-black text-emerald-500">{formatAED(approvedValue)}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              {approvedQuotes.length} Won
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" /> UAE 5% VAT Recorded
              </span>
              <p className="text-2xl font-black text-amber-500">{formatAED(totalVAT)}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
              Federal Tax
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> In-Flight / Sent
              </span>
              <p className="text-2xl font-black text-blue-400">{formatAED(sentValue)}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
              {sentQuotes.length} Pending
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Control & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border text-xs">
            {(["all", "goldland", "abbadi", "casavera"] as const).map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setCompanyFilter(comp)}
                className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                  companyFilter === comp
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {comp === "all" ? "All Entities" : comp === "goldland" ? "Goldland" : comp === "abbadi" ? "Abbadi" : "Casavera"}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border text-xs">
            {(["all", "approved", "sent", "draft"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reference, client, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-3">
        {filteredQuotes.map((quote) => (
          <div
            key={quote.id}
            className="p-4 rounded-xl border border-border/70 hover:border-border transition-all bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <Calculator className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-primary">
                    {quote.quote_number}
                  </span>
                  {getCompanyBadge(quote.operating_company)}
                  {getStatusBadge(quote.status)}
                </div>

                <p className="text-sm font-semibold text-foreground">
                  {quote.client_name} <span className="font-normal text-muted-foreground">({quote.client_company})</span>
                </p>

                {quote.project_name && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="font-semibold text-foreground/80">Project:</span>
                    <span className="truncate">{quote.project_name}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> Issued: {quote.issue_date}
                  </span>
                  <span>·</span>
                  <span className="font-mono">
                    Valid: {quote.valid_until}
                  </span>
                  <span>·</span>
                  <span>{quote.line_items.length} BOQ Line Items</span>
                </div>
              </div>
            </div>

            {/* Price Column & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-end md:self-center shrink-0">
              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Payable (5% VAT Inc.)
                </span>
                <span className="text-lg font-black font-mono text-foreground">
                  {formatAED(quote.total_amount)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Subtotal: {formatAED(quote.subtotal)} + VAT: {formatAED(quote.vat_amount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 1-Click WhatsApp Button */}
                <a
                  href={generateWhatsAppLink(quote)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  title="Share Quotation via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>

                {/* View & Print Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingQuote(quote)}
                  className="h-8 text-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View & Print
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quote Modal */}
      <CreateQuoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
        onCreateQuote={handleCreateQuote}
      />

      {/* View & Print Modal */}
      <QuoteViewModal
        quote={viewingQuote}
        isOpen={viewingQuote !== null}
        onClose={() => setViewingQuote(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
