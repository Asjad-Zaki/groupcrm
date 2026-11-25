import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Building2,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type {
  Quotation,
  QuoteLineItem,
  QuotePaymentMilestone,
  Project,
} from "../types";

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateQuote: (
    quote: Omit<Quotation, "id" | "created_at" | "updated_at">,
  ) => void;
}

export const CreateQuoteModal = ({
  isOpen,
  onClose,
  projects,
  onCreateQuote,
}: CreateQuoteModalProps) => {
  const [operatingCompany, setOperatingCompany] = useState<
    "goldland" | "abbadi" | "casavera"
  >("goldland");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("+971 ");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | "none">(
    "none",
  );
  const [validDays, setValidDays] = useState<number>(30);
  const [notes, setNotes] = useState(
    "Official governmental authority fees (DM/DCD/DEWA) billed at actuals. Subject to Dubai Courts jurisdiction and UAE commercial laws.",
  );

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    {
      id: "item-1",
      description:
        "Dubai Municipality (DM) and civil defense permitting package",
      unit: "L.S.",
      quantity: 1,
      unit_price: 35000,
      total: 35000,
    },
    {
      id: "item-2",
      description:
        "Supply and installation of architectural decor framing and partitions",
      unit: "SQM",
      quantity: 150,
      unit_price: 180,
      total: 27000,
    },
  ]);

  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });

  if (!isOpen) return null;

  const handleLineItemChange = (
    index: number,
    field: keyof QuoteLineItem,
    value: any,
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        const qty = Number(field === "quantity" ? value : item.quantity) || 0;
        const price =
          Number(field === "unit_price" ? value : item.unit_price) || 0;
        item.total = Math.round(qty * price);
      }
      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        unit: "L.S.",
        quantity: 1,
        unit_price: 10000,
        total: 10000,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  const vatRate = 0.05;
  const vatAmount = Math.round(subtotal * vatRate);
  const totalAmount = subtotal + vatAmount;

  // Staged payment milestones
  const milestones: QuotePaymentMilestone[] = [
    {
      id: "ms-1",
      percentage: 10,
      description: "Advance Payment upon Contract Signing & Mobilization",
      amount: Math.round(totalAmount * 0.1),
    },
    {
      id: "ms-2",
      percentage: 30,
      description: "Upon Authority (DM/DEWA/DDA) Approvals & 1st Fix",
      amount: Math.round(totalAmount * 0.3),
    },
    {
      id: "ms-3",
      percentage: 30,
      description: "Upon Workshop Joinery & Finishes Delivery to Site",
      amount: Math.round(totalAmount * 0.3),
    },
    {
      id: "ms-4",
      percentage: 30,
      description: "Upon Final Inspection Passed & Occupancy Handover (COC)",
      amount: Math.round(totalAmount * 0.3),
    },
  ];

  const getCompanyDetails = (comp: "goldland" | "abbadi" | "casavera") => {
    switch (comp) {
      case "goldland":
        return {
          name: "Goldland Contracting LLC",
          prefix: "GL",
          trn: "100234567800003",
          tenant_id: 1,
        };
      case "abbadi":
        return {
          name: "Abbadi Tech Technical Services LLC",
          prefix: "AT",
          trn: "100876543200003",
          tenant_id: 2,
        };
      case "casavera":
        return {
          name: "Casavera Interiors LLC",
          prefix: "CV",
          trn: "100543219800003",
          tenant_id: 3,
        };
    }
  };

  const compDetails = getCompanyDetails(operatingCompany);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const validUntilDate = new Date(Date.now() + validDays * 86400000)
      .toISOString()
      .split("T")[0];
    const quoteNumber = `${compDetails.prefix}-QT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const linkedProj =
      selectedProjectId !== "none"
        ? projects.find((p) => Number(p.id) === selectedProjectId)
        : undefined;

    onCreateQuote({
      quote_number: quoteNumber,
      tenant_id: compDetails.tenant_id,
      operating_company: operatingCompany,
      company_name: compDetails.name,
      trn_number: compDetails.trn,
      client_name: clientName.trim(),
      client_company: clientCompany.trim() || clientName.trim(),
      client_phone: clientPhone.trim() || undefined,
      client_email: clientEmail.trim() || undefined,
      project_id: linkedProj?.id,
      project_name: linkedProj?.name,
      issue_date: todayStr,
      valid_until: validUntilDate,
      currency: "AED",
      status: "draft",
      line_items: lineItems,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      payment_milestones: milestones,
      notes: notes.trim(),
      creator_name: "Navas (Managing Director)",
    });

    onClose();
  };

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-6 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Interactive UAE Quotation & BOQ Generator
            </h2>
            <p className="text-xs text-muted-foreground">
              Official commercial proposal with 5% UAE VAT and staged payment
              terms in AED.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Company & Project Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border/60">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Issuing UAE Entity *
              </label>
              <select
                value={operatingCompany}
                onChange={(e) => setOperatingCompany(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="goldland">
                  Goldland Contracting LLC (Approvals & Fit-out)
                </option>
                <option value="abbadi">
                  Abbadi Tech Technical Services (MEP & DEWA)
                </option>
                <option value="casavera">
                  Casavera Interiors LLC (Turnkey Luxury Interiors)
                </option>
              </select>
              <span className="text-[10px] text-muted-foreground block font-mono">
                TRN: {compDetails.trn}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Attach to Active Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value === "none" ? "none" : Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="none">-- Standalone New Quotation --</option>
                {projects.map((p) => (
                  <option key={p.id} value={Number(p.id)}>
                    {p.reference_no} · {p.name.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Validity Period
              </label>
              <select
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={15}>15 Calendar Days</option>
                <option value={30}>30 Calendar Days (Standard UAE)</option>
                <option value={60}>60 Calendar Days</option>
              </select>
            </div>
          </div>

          {/* Client Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Client Contact Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Eng. Tariq Al-Falasi"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Client Organization
              </label>
              <input
                type="text"
                placeholder="e.g., Al Falasi Properties LLC"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Client WhatsApp / Phone *
              </label>
              <input
                type="text"
                required
                placeholder="+971 50 123 4567"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Client Email
              </label>
              <input
                type="email"
                placeholder="client@company.ae"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Line Items Table Builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Quotation Line Items (BOQ Schedule)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="h-7 text-xs flex items-center gap-1 text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    <th className="py-2.5 px-3 font-semibold w-1/2">
                      Scope Description
                    </th>
                    <th className="py-2.5 px-2 font-semibold">Unit</th>
                    <th className="py-2.5 px-2 font-semibold w-16">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Unit Rate (AED)
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Total (AED)
                    </th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-mono text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          placeholder="Scope of works description..."
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              idx,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1 rounded bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            handleLineItemChange(idx, "unit", e.target.value)
                          }
                          className="w-full px-1.5 py-1 rounded bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        >
                          <option value="L.S.">L.S.</option>
                          <option value="SQM">SQM</option>
                          <option value="NO">NO</option>
                          <option value="RMT">RMT</option>
                          <option value="LOT">LOT</option>
                          <option value="HOURS">HRS</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(
                              idx,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-2 py-1 rounded bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          required
                          value={item.unit_price}
                          onChange={(e) =>
                            handleLineItemChange(
                              idx,
                              "unit_price",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-2 py-1 rounded bg-background border border-border text-foreground font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                        {formatAED(item.total)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          disabled={lineItems.length <= 1}
                          className="p-1 rounded text-muted-foreground hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Schedule breakdown */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <span className="font-bold text-foreground block">
                Proposed UAE Milestone Payment Schedule
              </span>
              <div className="space-y-1.5">
                {milestones.map((ms, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] text-muted-foreground py-0.5 border-b border-border/40 last:border-0"
                  >
                    <span className="truncate pr-2">
                      <strong>{ms.percentage}%</strong> {ms.description}
                    </span>
                    <strong className="font-mono text-foreground shrink-0">
                      {formatAED(ms.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-right">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal (Net of Tax):</span>
                <span className="font-mono font-bold text-foreground">
                  {formatAED(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>UAE Federal VAT (5%):</span>
                <span className="font-mono font-bold text-amber-500">
                  {formatAED(vatAmount)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                <span>Grand Total (AED):</span>
                <span className="text-primary font-black">
                  {formatAED(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Proposal Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Generate Quotation & BOQ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
