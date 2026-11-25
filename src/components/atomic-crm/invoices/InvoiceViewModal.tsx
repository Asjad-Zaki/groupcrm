import {
  X,
  MessageCircle,
  Printer,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { Invoice } from "../types";

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment?: (invoice: Invoice) => void;
}

export const InvoiceViewModal = ({
  invoice,
  isOpen,
  onClose,
  onRecordPayment,
}: InvoiceViewModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });

  if (!isOpen || !invoice) return null;

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const cleanPhone = (invoice.client_phone || "+971501234567").replace(
      /[^0-9]/g,
      "",
    );
    const statusText =
      invoice.status === "paid"
        ? "[PAID IN FULL]"
        : invoice.status === "partially_paid"
          ? "[PARTIALLY PAID]"
          : "[PAYMENT DUE]";

    const message = [
      `*TAX INVOICE NOTIFICATION*`,
      `*${invoice.company_name}*`,
      `TRN: ${invoice.trn_number}`,
      `---------------------------------`,
      `Dear *${invoice.client_name}* (${invoice.client_company}),`,
      `Here is the commercial tax invoice details for *${invoice.project_name || "Commercial Project"}*:`,
      ``,
      `• *Invoice No:* ${invoice.invoice_number}`,
      `• *Status:* ${statusText}`,
      `• *Issue Date:* ${invoice.issue_date}`,
      `• *Due Date:* ${invoice.due_date}`,
      ``,
      `• *Gross Milestone:* ${formatAED(invoice.gross_amount)}`,
      `• *UAE Federal VAT (5%):* ${formatAED(invoice.vat_amount)}`,
      `• *10% Contract Retention Held:* -${formatAED(invoice.retention_amount)}`,
      `• *Net Payable:* ${formatAED(invoice.net_payable)}`,
      `• *Total Received:* ${formatAED(invoice.amount_paid)}`,
      `• *Outstanding Balance Due:* *${formatAED(invoice.balance_due)}*`,
      ``,
      `*Bank Transfer Details:*`,
      `• Bank: ${invoice.bank_name || "Emirates NBD"}`,
      `• IBAN: ${invoice.bank_iban || "AE450260001002345678001"}`,
      `---------------------------------`,
      `Please reply with payment transfer confirmation. Thank you!`,
    ].join("\n");

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 print:border-none print:shadow-none print:p-0">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between p-4 border-b border-border/80 bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Commercial Tax Invoice
            </span>
            <Badge
              variant="outline"
              className={
                invoice.status === "paid"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : invoice.status === "partially_paid"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : invoice.status === "overdue"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }
            >
              {invoice.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {invoice.balance_due > 0 && onRecordPayment && (
              <Button
                type="button"
                size="sm"
                onClick={() => onRecordPayment(invoice)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Record Payment
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Reminder
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded ml-1">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted ml-1 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Sheet */}
        <div className="p-8 space-y-6 bg-card print:bg-white print:text-black">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border/60 pb-6 print:border-black/20">
            <div>
              <div className="flex items-center gap-2 text-primary print:text-black">
                <Building2 className="w-6 h-6" />
                <h2 className="text-xl font-bold">{invoice.company_name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1 print:text-gray-600">
                Tax Registration No (TRN):{" "}
                <span className="font-mono font-bold text-foreground print:text-black">
                  {invoice.trn_number}
                </span>
              </p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Dubai, United Arab Emirates • info@groupcrm.ae
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-lg font-black tracking-wider text-foreground uppercase print:text-black">
                TAX INVOICE
              </div>
              <p className="text-xs font-mono font-bold text-primary print:text-black">
                {invoice.invoice_number}
              </p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Issue Date: {invoice.issue_date}
              </p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Due Date:{" "}
                <span className="font-semibold text-foreground print:text-black">
                  {invoice.due_date}
                </span>
              </p>
            </div>
          </div>

          {/* Client & Project Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 print:bg-transparent print:border-black/20 text-xs">
            <div>
              <span className="font-bold text-muted-foreground uppercase tracking-wider print:text-gray-600">
                BILLED TO:
              </span>
              <p className="font-bold text-sm text-foreground mt-1 print:text-black">
                {invoice.client_name}
              </p>
              <p className="text-muted-foreground print:text-gray-600">
                {invoice.client_company}
              </p>
              <p className="text-muted-foreground print:text-gray-600">
                Mobile: {invoice.client_phone}
              </p>
              <p className="text-muted-foreground print:text-gray-600">
                Email: {invoice.client_email}
              </p>
            </div>

            <div>
              <span className="font-bold text-muted-foreground uppercase tracking-wider print:text-gray-600">
                PROJECT PARTICULARS:
              </span>
              <p className="font-bold text-sm text-foreground mt-1 print:text-black">
                {invoice.project_name || "General Commercial Fitout"}
              </p>
              {invoice.quotation_ref && (
                <p className="text-muted-foreground print:text-gray-600">
                  Quotation Ref:{" "}
                  <span className="font-mono font-semibold">
                    {invoice.quotation_ref}
                  </span>
                </p>
              )}
              <p className="text-muted-foreground print:text-gray-600">
                Jurisdiction: Dubai, United Arab Emirates
              </p>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="border border-border/60 rounded-xl overflow-hidden print:border-black/20">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border/60 print:bg-gray-100 print:border-black/20">
                <tr>
                  <th className="p-3 text-left font-bold text-muted-foreground print:text-black">
                    DESCRIPTION / SCOPE OF BILLING
                  </th>
                  <th className="p-3 text-right font-bold text-muted-foreground print:text-black">
                    AMOUNT (AED)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 print:divide-black/10">
                <tr>
                  <td className="p-3 text-foreground print:text-black font-medium">
                    Certified Commercial Milestone Progress Billing
                    <p className="text-[11px] text-muted-foreground print:text-gray-600">
                      As per agreed contractual stages and engineer inspection
                      sign-off.
                    </p>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-foreground print:text-black">
                    {formatAED(invoice.gross_amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Box */}
            <div className="p-4 bg-muted/20 border-t border-border/60 space-y-2 text-xs print:bg-transparent print:border-black/20">
              <div className="flex justify-between text-muted-foreground print:text-gray-600">
                <span>Gross Milestone Subtotal:</span>
                <span className="font-mono font-medium">
                  {formatAED(invoice.gross_amount)}
                </span>
              </div>
              <div className="flex justify-between text-amber-500 print:text-black">
                <span>UAE Federal VAT (5%):</span>
                <span className="font-mono font-medium">
                  +{formatAED(invoice.vat_amount)}
                </span>
              </div>
              <div className="flex justify-between text-blue-400 print:text-black">
                <span>Less: 10% Defect Liability Retention (DLP Escrow):</span>
                <span className="font-mono font-medium">
                  -{formatAED(invoice.retention_amount)}
                </span>
              </div>
              <div className="border-t border-border/60 pt-2 flex justify-between text-sm font-bold text-foreground print:text-black">
                <span>Net Invoice Payable:</span>
                <span className="font-mono">
                  {formatAED(invoice.net_payable)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 print:text-black">
                <span>Collections Received to Date:</span>
                <span className="font-mono font-semibold">
                  {formatAED(invoice.amount_paid)}
                </span>
              </div>
              <div className="border-t border-border/80 pt-2 flex justify-between text-base font-black text-foreground print:text-black">
                <span>Balance Outstanding Due:</span>
                <span className="font-mono text-primary print:text-black">
                  {formatAED(invoice.balance_due)}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Wire Details & Terms */}
          <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-2 text-xs print:border-black/20">
            <span className="font-bold text-foreground uppercase tracking-wider print:text-black">
              Bank Wire Transfer Details:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground print:text-gray-700">
              <div>
                <span>Bank: </span>
                <span className="font-semibold text-foreground print:text-black">
                  {invoice.bank_name || "Emirates NBD"}
                </span>
              </div>
              <div>
                <span>IBAN: </span>
                <span className="font-mono font-bold text-foreground print:text-black">
                  {invoice.bank_iban || "AE450260001002345678001"}
                </span>
              </div>
            </div>
            {invoice.notes && (
              <p className="text-[11px] text-muted-foreground pt-1 print:text-gray-600">
                <span className="font-semibold">Notes:</span> {invoice.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
