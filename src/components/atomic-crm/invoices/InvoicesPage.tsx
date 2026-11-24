import { useState, useMemo } from "react";
import { useGetList, useCreate, useUpdate, useNotify } from "ra-core";
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  MessageCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceViewModal } from "./InvoiceViewModal";
import { RecordPaymentModal } from "./RecordPaymentModal";
import type { Invoice } from "../types";

export const InvoicesPage = () => {
  const notify = useNotify();
  const [create] = useCreate();
  const [update] = useUpdate();

  const [entityFilter, setEntityFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], refetch } = useGetList<Invoice>("invoices", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "issue_date", order: "DESC" },
  });

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (entityFilter !== "all" && inv.tenant_id !== entityFilter) return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = inv.invoice_number.toLowerCase().includes(q);
        const matchClient = inv.client_name.toLowerCase().includes(q);
        const matchCompany = inv.client_company.toLowerCase().includes(q);
        const matchProj = (inv.project_name || "").toLowerCase().includes(q);
        if (!matchNum && !matchClient && !matchCompany && !matchProj) return false;
      }
      return true;
    });
  }, [invoices, entityFilter, statusFilter, searchQuery]);

  // Financial KPI Metrics
  const metrics = useMemo(() => {
    const totalBilled = invoices.reduce((acc, curr) => acc + curr.net_payable, 0);
    const totalCollected = invoices.reduce((acc, curr) => acc + curr.amount_paid, 0);
    const totalRetention = invoices.reduce((acc, curr) => acc + curr.retention_amount, 0);
    const overdueReceivables = invoices
      .filter((inv) => inv.status === "overdue" || (inv.balance_due > 0 && new Date(inv.due_date) < new Date()))
      .reduce((acc, curr) => acc + curr.balance_due, 0);

    return { totalBilled, totalCollected, totalRetention, overdueReceivables };
  }, [invoices]);

  const handleCreateInvoice = async (data: Omit<Invoice, "id">) => {
    await create("invoices", { data });
    refetch();
  };

  const handlePaymentRecorded = async (updated: Invoice) => {
    await update("invoices", {
      id: updated.id,
      data: updated,
      previousData: updated,
    });
    refetch();
    if (selectedInvoice && selectedInvoice.id === updated.id) {
      setSelectedInvoice(updated);
    }
  };

  const handleWhatsApp = (inv: Invoice) => {
    const cleanPhone = (inv.client_phone || "+971501234567").replace(/[^0-9]/g, "");
    const message = [
      `*PAYMENT REMINDER*`,
      `*${inv.company_name}*`,
      `Invoice: *${inv.invoice_number}*`,
      `Project: ${inv.project_name || "Commercial Project"}`,
      `---------------------------------`,
      `Dear *${inv.client_name}*,`,
      `This is a gentle reminder regarding the outstanding balance of *${formatAED(inv.balance_due)}* due on *${inv.due_date}*.`,
      ``,
      `• *Total Net Invoiced:* ${formatAED(inv.net_payable)}`,
      `• *Payments Received:* ${formatAED(inv.amount_paid)}`,
      `• *Balance Due:* *${formatAED(inv.balance_due)}*`,
      ``,
      `Please transfer to:`,
      `Bank: ${inv.bank_name || "Emirates NBD"}`,
      `IBAN: ${inv.bank_iban || "AE450260001002345678001"}`,
      `---------------------------------`,
      `Thank you for your business!`,
    ].join("\n");

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    notify(`Opened WhatsApp payment reminder for ${inv.client_name}`, { type: "info" });
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                GroupCRM Commercial Invoices & Retention
              </h2>
              <p className="text-xs text-muted-foreground">
                Progressive UAE Tax Invoices with 5% VAT, 10% DLP contract retention, and WhatsApp collections.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Issue Progressive Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Net Invoiced
              </p>
              <p className="text-2xl font-black text-foreground mt-1">
                {formatAED(metrics.totalBilled)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {invoices.length} Invoices Issued
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Collections Received
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {formatAED(metrics.totalCollected)}
              </p>
              <span className="text-[10px] text-emerald-500/80">
                {metrics.totalBilled > 0
                  ? Math.round((metrics.totalCollected / metrics.totalBilled) * 100)
                  : 0}
                % Collection Rate
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                UAE DLP Retention Held
              </p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {formatAED(metrics.totalRetention)}
              </p>
              <span className="text-[10px] text-blue-400/80">10% Standard Escrow</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pending / Overdue
              </p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {formatAED(metrics.overdueReceivables)}
              </p>
              <span className="text-[10px] text-amber-400/80">Requires Follow-up</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-2">
          {/* Entity Filters */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setEntityFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                entityFilter === "all"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Entities
            </button>
            <button
              type="button"
              onClick={() => setEntityFilter(1)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                entityFilter === 1
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Goldland
            </button>
            <button
              type="button"
              onClick={() => setEntityFilter(2)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                entityFilter === 2
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Abbadi
            </button>
            <button
              type="button"
              onClick={() => setEntityFilter(3)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                entityFilter === 3
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Casavera
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-medium">
            {["all", "pending", "partially_paid", "paid", "overdue"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? "All Status" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoice #, client, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.map((inv) => (
          <Card
            key={inv.id}
            className="bg-card/40 border-border/80 hover:bg-card/70 transition-all shadow-sm"
          >
            <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Left Column: Number, Entity, Client, Project */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-base text-foreground">
                    {inv.invoice_number}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      inv.tenant_id === 1
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"
                        : inv.tenant_id === 2
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                    }
                  >
                    {inv.company_name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      inv.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                        : inv.status === "partially_paid"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
                          : inv.status === "overdue"
                            ? "bg-red-500/10 text-red-400 border-red-500/30 text-[10px]"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                    }
                  >
                    {inv.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-foreground">
                  <span className="font-bold">{inv.client_name}</span> ({inv.client_company})
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>Project: <strong className="text-foreground">{inv.project_name || "Commercial Contract"}</strong></span>
                  <span>•</span>
                  <span>Due: {inv.due_date}</span>
                </div>
              </div>

              {/* Right Column: Financial Figures & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-muted-foreground">Net Invoiced:</div>
                  <div className="text-lg font-black text-foreground">
                    {formatAED(inv.net_payable)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Bal Due: <span className="font-bold text-amber-400">{formatAED(inv.balance_due)}</span>
                    {inv.retention_amount > 0 && (
                      <span className="ml-2 text-blue-400 font-medium">
                        (DLP: {formatAED(inv.retention_amount)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inv.balance_due > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setPaymentInvoice(inv)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pay
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(inv)}
                    className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(inv)}
                    className="text-xs gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
            <Receipt className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">No tax invoices found.</p>
            <p className="text-xs">Adjust your search or click "Issue Progressive Invoice".</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateInvoice={handleCreateInvoice}
      />

      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        onRecordPayment={(inv) => {
          setSelectedInvoice(null);
          setPaymentInvoice(inv);
        }}
      />

      <RecordPaymentModal
        invoice={paymentInvoice}
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        onPaymentRecorded={handlePaymentRecorded}
      />
    </div>
  );
};
