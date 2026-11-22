import { useState } from "react";
import { X, FileText, Building2, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectDocumentNOC } from "../types";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doc: Omit<ProjectDocumentNOC, "id">) => void;
}

export const AddDocumentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddDocumentModalProps) => {
  const [authority, setAuthority] = useState("Dubai Municipality (DM)");
  const [category, setCategory] = useState<ProjectDocumentNOC["category"]>("permit");
  const [title, setTitle] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [status, setStatus] = useState<ProjectDocumentNOC["status"]>("under_review");
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !referenceNo.trim()) return;

    onSubmit({
      authority: authority.trim(),
      category,
      title: title.trim(),
      reference_no: referenceNo.trim(),
      status,
      submission_date: submissionDate || undefined,
      approval_date: status === "approved" ? new Date().toISOString().split("T")[0] : undefined,
      expiry_date: expiryDate || undefined,
      file_type: "PDF",
      file_size: "2.4 MB",
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">Add Permit / NOC Document</h2>
            <p className="text-xs text-muted-foreground">
              Register authority submission, NOC reference, or contractor compliance certificate.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Authority / Body *
              </label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Dubai Municipality (DM)">Dubai Municipality (DM)</option>
                <option value="Dubai Civil Defence (DCD)">Dubai Civil Defence (DCD)</option>
                <option value="Dubai Electricity & Water Authority (DEWA)">DEWA</option>
                <option value="Dubai Development Authority (DDA)">DDA (TECOM)</option>
                <option value="Trakhees (PCFC)">Trakhees (PCFC)</option>
                <option value="Emaar Properties PJSC">Emaar Properties PJSC</option>
                <option value="Nakheel Community Management">Nakheel Community Management</option>
                <option value="Concordia (DMCC/JLT)">Concordia (DMCC/JLT)</option>
                <option value="Dubai South (DWC)">Dubai South (DWC)</option>
                <option value="Other Regulatory Authority">Other Regulatory Authority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Document Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectDocumentNOC["category"])}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="permit">Official Authority Permit</option>
                <option value="drawing">Approved Engineering Drawing</option>
                <option value="noc">Developer / Landlord NOC</option>
                <option value="rams">Method Statement & RAMS</option>
                <option value="contract">Contract / Insurance Policy</option>
                <option value="handover">Completion Certificate / COC</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Document Title *</label>
            <input
              type="text"
              required
              placeholder="E.g., Fit-out Building Permit or Fire Alarm Layout Clearance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Reference / Application # *</label>
              <input
                type="text"
                required
                placeholder="E.g., DM/BP/2026/049182"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Permitting Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectDocumentNOC["status"])}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="approved">Approved</option>
                <option value="under_review">Under Authority Review</option>
                <option value="revision_required">Revision Required / Comments Issued</option>
                <option value="pending_submission">Pending Submission</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Submission Date
              </label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Expiry Date (if applicable)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Conditions / Portal Notes</label>
            <input
              type="text"
              placeholder="E.g., Approved with condition of night-time hauling only"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
