import { useState, useMemo } from "react";
import { X, Receipt, Calculator, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetList, useNotify } from "ra-core";
import type { Invoice, Project, Quotation } from "../types";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (newInvoice: Omit<Invoice, "id">) => void;
}

export const CreateInvoiceModal = ({
  isOpen,
  onClose,
  onCreateInvoice,
}: CreateInvoiceModalProps) => {
  const notify = useNotify();

  const [tenantId, setTenantId] = useState<number>(1);
  const [projectId, setProjectId] = useState<string>("");
  const [quotationRef, setQuotationRef] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientCompany, setClientCompany] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("+971 50 ");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [grossAmount, setGrossAmount] = useState<number>(85000);
  const [dueDate, setDueDate] = useState<string>("2026-12-15");
  const [notes, setNotes] = useState<string>(
    "Milestone progress payment. 10% DLP retention held for 12 months."
  );

  const { data: projects } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 20 },
  });

  const { data: quotes } = useGetList<Quotation>("quotations", {
    pagination: { page: 1, perPage: 20 },
  });

  const entityConfig = useMemo(() => {
    switch (tenantId) {
      case 1:
        return {
          company_name: "Goldland Contracting LLC",
          operating_company: "goldland" as const,
          trn_number: "100234567800003",
          bank_name: "Emirates NBD - Dubai Branch",
          bank_iban: "AE450260001002345678001",
          prefix: "GL",
        };
      case 2:
        return {
          company_name: "Abbadi Tech Technical Services LLC",
          operating_company: "abbadi" as const,
          trn_number: "100876543200003",
          bank_name: "Abu Dhabi Commercial Bank (ADCB)",
          bank_iban: "AE120030002008765432001",
          prefix: "AT",
        };
      case 3:
      default:
        return {
          company_name: "Casavera Interiors LLC",
          operating_company: "casavera" as const,
          trn_number: "100456789000003",
          bank_name: "Dubai Islamic Bank (DIB)",
          bank_iban: "AE880240003004567890001",
          prefix: "CV",
        };
    }
  }, [tenantId]);

  if (!isOpen) return null;

  const vatAmount = Math.round(grossAmount * 0.05);
  const retentionAmount = Math.round(grossAmount * 0.10);
  const netPayable = grossAmount + vatAmount - retentionAmount;

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleProjectSelect = (pId: string) => {
    setProjectId(pId);
    const foundProj = projects?.find((p) => p.id === Number(pId));
    if (foundProj) {
      setTenantId(foundProj.tenant_id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientCompany.trim()) {
      notify("Please provide client details", { type: "warning" });
      return;
    }

    const selectedProj = projects?.find((p) => p.id === Number(projectId));
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const invoiceNum = `${entityConfig.prefix}-INV-2026-${randomSeq}`;

    const newInvoice: Omit<Invoice, "id"> = {
      invoice_number: invoiceNum,
      tenant_id: tenantId,
      operating_company: entityConfig.operating_company,
      company_name: entityConfig.company_name,
      trn_number: entityConfig.trn_number,
      quotation_ref: quotationRef || undefined,
      project_id: projectId ? Number(projectId) : undefined,
      project_name: selectedProj ? selectedProj.name : "Commercial Fitout Contract",
      client_name: clientName,
      client_company: clientCompany,
      client_phone: clientPhone,
      client_email: clientEmail,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate,
      currency: "AED",
      status: "pending",
      gross_amount: grossAmount,
      vat_rate: 0.05,
      vat_amount: vatAmount,
      retention_rate: 0.10,
      retention_amount: retentionAmount,
      net_payable: netPayable,
      amount_paid: 0,
      balance_due: netPayable,
      bank_name: entityConfig.bank_name,
      bank_iban: entityConfig.bank_iban,
      notes: notes,
    };

    onCreateInvoice(newInvoice);
    notify(`Created Tax Invoice ${invoiceNum} for ${formatAED(netPayable)}`, {
      type: "success",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Create Progressive Tax Invoice</h3>
              <p className="text-xs text-muted-foreground">
                Automatic 5% UAE Federal VAT and 10% DLP Retention calculations
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Entity & Project Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Issuing UAE Entity *
              </label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              >
                <option value={1}>Goldland Contracting LLC (TRN: 100234567800003)</option>
                <option value={2}>Abbadi Tech Technical Services (TRN: 100876543200003)</option>
                <option value={3}>Casavera Interiors LLC (TRN: 100456789000003)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Link Active Project</label>
              <select
                value={projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              >
                <option value="">-- Standalone Commercial Invoice --</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.reference_no})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quotation link & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Quotation Reference</label>
              <select
                value={quotationRef}
                onChange={(e) => setQuotationRef(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              >
                <option value="">-- Select Quotation (Optional) --</option>
                {quotes?.map((q) => (
                  <option key={q.id} value={q.quote_number}>
                    {q.quote_number} • {q.client_name} ({formatAED(q.total_amount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-semibold">Payment Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold">Client Contact Name *</label>
              <input
                type="text"
                placeholder="e.g., Eng. Tariq Al-Falasi"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold">Client Company / Entity *</label>
              <input
                type="text"
                placeholder="e.g., Al Falasi Properties LLC"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">WhatsApp / Phone *</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Client Email</label>
              <input
                type="email"
                placeholder="client@domain.ae"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
          </div>

          {/* Gross Milestone Amount */}
          <div className="space-y-1.5 text-xs">
            <label className="text-foreground font-bold">
              Gross Milestone Billing Amount (AED net of tax) *
            </label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={grossAmount}
              onChange={(e) => setGrossAmount(Number(e.target.value))}
              required
              className="w-full text-base font-bold bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground"
            />
          </div>

          {/* Live Calculation Box */}
          <div className="p-4 bg-muted/30 border border-border/60 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross Milestone Subtotal:</span>
              <span className="font-mono">{formatAED(grossAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-500">
              <span>UAE Federal VAT (5%):</span>
              <span className="font-mono">+{formatAED(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Less: 10% Defect Liability Retention (Held in Escrow):</span>
              <span className="font-mono">-{formatAED(retentionAmount)}</span>
            </div>
            <div className="border-t border-border/80 pt-2 flex justify-between text-base font-bold text-foreground">
              <span>Net Invoiced Payable:</span>
              <span className="font-mono text-primary">{formatAED(netPayable)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-xs">
            <label className="text-muted-foreground font-medium">Terms & Commercial Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5"
            >
              <Calculator className="w-4 h-4" /> Issue Tax Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
