import { X, MessageCircle, Printer, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quotation } from "../types";

interface QuoteViewModalProps {
  quote: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (quote: Quotation, newStatus: Quotation["status"]) => void;
}

export const QuoteViewModal = ({
  quote,
  isOpen,
  onClose,
  onStatusChange,
}: QuoteViewModalProps) => {
  if (!isOpen || !quote) return null;

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

  // Generate WhatsApp formatted text
  const cleanPhone = getCleanPhone(quote.client_phone);
  const waMilestonesText = quote.payment_milestones
    ? quote.payment_milestones
        .map((m) => `• ${m.percentage}%: ${formatAED(m.amount)} (${m.description})`)
        .join("\n")
    : "";

  const whatsappMessage = `*QUOTATION & COMMERCIAL PROPOSAL*
*${quote.company_name}*
TRN: ${quote.trn_number}
----------------------------------------
*Quotation No:* ${quote.quote_number}
*Client:* ${quote.client_name} (${quote.client_company})
*Date:* ${quote.issue_date}
*Valid Until:* ${quote.valid_until}
${quote.project_name ? `*Project:* ${quote.project_name}\n` : ""}----------------------------------------
*Financial Summary:*
• Subtotal: ${formatAED(quote.subtotal)}
• UAE VAT (5%): ${formatAED(quote.vat_amount)}
*Grand Total: ${formatAED(quote.total_amount)}*
----------------------------------------
*Payment Milestones:*
${waMilestonesText}
----------------------------------------
*Terms:* Official authority fees billed at actuals.
Please reply to this WhatsApp message to confirm approval or request any revisions. Thank you for your business!`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const handlePrint = () => {
    window.print();
  };

  const getCompanyBrandColor = (comp: string) => {
    switch (comp) {
      case "goldland":
        return { border: "border-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" };
      case "abbadi":
        return { border: "border-blue-500", text: "text-blue-500", bg: "bg-blue-500/10" };
      case "casavera":
        return { border: "border-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" };
      default:
        return { border: "border-primary", text: "text-primary", bg: "bg-primary/10" };
    }
  };

  const brand = getCompanyBrandColor(quote.operating_company);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-6 my-6 animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:p-0 print:my-0">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary">{quote.quote_number}</span>
            <Badge
              variant="outline"
              className={`text-[10px] capitalize font-bold ${
                quote.status === "approved"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : quote.status === "sent"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
              }`}
            >
              {quote.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Share via WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Share via WhatsApp
            </a>

            {/* Print / Save PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>

            {onStatusChange && quote.status !== "approved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(quote, "approved")}
                className="text-xs flex items-center gap-1 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Approved
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letterhead & Quotation Document */}
        <div className="space-y-6 text-foreground bg-background p-6 rounded-xl border border-border/60 print:border-none print:p-0">
          {/* Header Row: Company & Quotation Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className={`w-5 h-5 ${brand.text}`} />
                <h1 className="text-xl font-black tracking-tight">{quote.company_name}</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Office 1402, Business Bay, Dubai, United Arab Emirates
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Tax Registration No (TRN): <strong className="text-foreground">{quote.trn_number}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Phone: +971 4 220 1890 · Email: info@{quote.operating_company === "goldland" ? "goldlandcontracting.com" : quote.operating_company === "abbadi" ? "abbaditech.com" : "casaverainteriors.com"}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 shrink-0 p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                COMMERCIAL PROPOSAL / QUOTATION
              </span>
              <p className="text-base font-black font-mono text-primary">{quote.quote_number}</p>
              <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                <p>Date: <strong className="text-foreground font-mono">{quote.issue_date}</strong></p>
                <p>Valid Until: <strong className="text-foreground font-mono">{quote.valid_until}</strong></p>
              </div>
            </div>
          </div>

          {/* Client & Project Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Client / Recipient:</span>
              <p className="font-bold text-foreground text-sm">{quote.client_name}</p>
              <p className="text-muted-foreground">{quote.client_company}</p>
              {quote.client_phone && (
                <p className="text-muted-foreground font-mono">Mobile: {quote.client_phone}</p>
              )}
              {quote.client_email && (
                <p className="text-muted-foreground">Email: {quote.client_email}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Project Particulars:</span>
              <p className="font-bold text-foreground text-sm">
                {quote.project_name || "General Commercial Scope"}
              </p>
              <p className="text-muted-foreground">Currency: UAE Dirham (AED)</p>
              <p className="text-muted-foreground">Tax Status: Standard 5% UAE Federal VAT</p>
            </div>
          </div>

          {/* Line Items BOQ Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-12 text-center">#</th>
                  <th className="py-2.5 px-3 font-bold">Scope of Works / Specification</th>
                  <th className="py-2.5 px-3 font-bold w-16 text-center">Unit</th>
                  <th className="py-2.5 px-3 font-bold w-16 text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right w-28">Rate (AED)</th>
                  <th className="py-2.5 px-3 font-bold text-right w-32">Total (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quote.line_items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{item.description}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-foreground font-semibold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{formatAED(item.unit_price)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{formatAED(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Payment Schedule */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2 text-xs">
              <span className="font-bold text-foreground block">Proposed Milestone Payment Schedule:</span>
              <div className="space-y-1.5">
                {quote.payment_milestones.map((ms, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                    <span className="truncate pr-2">
                      <strong className="text-primary font-mono">{ms.percentage}%</strong> {ms.description}
                    </span>
                    <strong className="font-mono text-foreground shrink-0">{formatAED(ms.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (Net of Tax):</span>
                <span className="font-mono font-bold text-foreground">{formatAED(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>UAE Federal VAT (5%):</span>
                <span className="font-mono font-bold text-amber-500">{formatAED(quote.vat_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                <span>Total Payable (AED):</span>
                <span className="text-primary font-black text-lg">{formatAED(quote.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {quote.notes && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Terms & Conditions: </strong>
              {quote.notes}
            </div>
          )}

          {/* Signature & Stamp Area */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border text-xs">
            <div className="space-y-4">
              <span className="text-muted-foreground font-semibold">For & On Behalf of {quote.company_name}:</span>
              <div className="h-16 border-b border-dashed border-border/80 flex items-end pb-1 font-mono text-[11px] text-muted-foreground">
                Authorized Signatory & Stamp
              </div>
            </div>

            <div className="space-y-4 text-right">
              <span className="text-muted-foreground font-semibold">Client Acceptance & Confirmation:</span>
              <div className="h-16 border-b border-dashed border-border/80 flex items-end justify-end pb-1 font-mono text-[11px] text-muted-foreground">
                Signature & Official Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
