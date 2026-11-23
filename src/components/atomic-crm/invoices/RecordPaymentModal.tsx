import { useState, useEffect } from "react";
import { X, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotify } from "ra-core";
import type { Invoice } from "../types";

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: (updatedInvoice: Invoice) => void;
}

export const RecordPaymentModal = ({
  invoice,
  isOpen,
  onClose,
  onPaymentRecorded,
}: RecordPaymentModalProps) => {
  const notify = useNotify();

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cheque" | "card">("bank_transfer");
  const [reference, setReference] = useState<string>("");
  const [bankName, setBankName] = useState<string>("Emirates NBD - Dubai Branch");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (invoice) {
      setPaymentAmount(invoice.balance_due);
      setReference(`TRF-${Math.floor(100000 + Math.random() * 900000)}`);
      setNotes(`Progress milestone payment against invoice ${invoice.invoice_number}`);
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      notify("Please enter a valid payment amount", { type: "warning" });
      return;
    }

    const newAmountPaid = invoice.amount_paid + paymentAmount;
    const newBalanceDue = Math.max(0, invoice.net_payable - newAmountPaid);
    const newStatus: Invoice["status"] = newBalanceDue === 0 ? "paid" : "partially_paid";

    const updated: Invoice = {
      ...invoice,
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus,
      payment_method: paymentMethod,
      payment_reference: reference,
      payment_date: paymentDate,
      bank_name: bankName,
      notes: notes,
    };

    onPaymentRecorded(updated);
    notify(`Recorded ${formatAED(paymentAmount)} payment for ${invoice.invoice_number}`, {
      type: "success",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Record Payment Collection</h3>
              <p className="text-xs text-muted-foreground">
                Invoice {invoice.invoice_number} • {invoice.client_company}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Net Invoice Payable:</span>
              <p className="font-bold text-foreground text-sm">{formatAED(invoice.net_payable)}</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Current Balance Due:</span>
              <p className="font-bold text-amber-400 text-sm">{formatAED(invoice.balance_due)}</p>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Payment Amount Received (AED) *
            </label>
            <input
              type="number"
              min={1}
              max={invoice.balance_due}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              required
              className="w-full text-sm font-semibold bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                paymentMethod === "bank_transfer"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cheque")}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                paymentMethod === "cheque"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              UAE Cheque
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                paymentMethod === "card"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              Credit Card
            </button>
          </div>

          {/* Reference & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Reference / Cheque No.</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Bank Deposited</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-foreground"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5 text-xs">
            <label className="text-muted-foreground font-medium">Collection Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-foreground"
            />
          </div>

          {/* Receipt Notes */}
          <div className="space-y-1.5 text-xs">
            <label className="text-muted-foreground font-medium">Receipt Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-foreground"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Receipt & Update Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
