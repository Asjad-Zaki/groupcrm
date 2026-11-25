import { useState } from "react";
import { X, User, Phone, Mail, Building, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { ProjectTeamMember } from "../types";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<ProjectTeamMember, "id">) => void;
}

export const AddTeamMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddTeamMemberModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [name, setName] = useState("");
  const [role, setRole] = useState("Site Engineer");
  const [company, setCompany] = useState("Goldland Contracting LLC");
  const [phone, setPhone] = useState("+971 ");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      is_primary_contact: isPrimary,
    });

    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">
              Add Project Key Contact
            </h2>
            <p className="text-xs text-muted-foreground">
              Add internal engineer, client representative, or subcontractor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Eng. Junaid or Sarah Al-Falasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Role / Title
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Site Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Organization
              </label>
              <input
                type="text"
                required
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
            </label>
            <input
              type="text"
              placeholder="+971 50 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              placeholder="engineer@company.ae"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="isPrimary"
              className="font-medium text-foreground cursor-pointer"
            >
              Designate as Primary Project Contact
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Contact
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
