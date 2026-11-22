import { useState } from "react";
import { Link } from "react-router";
import { useUpdate, useNotify } from "ra-core";
import {
  FileText,
  FileCheck2,
  FolderOpen,
  ExternalLink,
  Plus,
  Search,
  Building2,
  Clock,
  AlertCircle,
  Download,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddDocumentModal } from "./AddDocumentModal";
import type { Project, ProjectDocumentNOC } from "../types";

interface DocumentsNOCTabProps {
  project: Project;
  onRefresh: () => void;
}

export const DocumentsNOCTab = ({ project, onRefresh }: DocumentsNOCTabProps) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const docs = project.noc_documents || [];

  const handleAddDoc = async (newDocData: Omit<ProjectDocumentNOC, "id">) => {
    const newDoc: ProjectDocumentNOC = {
      ...newDocData,
      id: `doc-${Date.now()}`,
    };

    const updatedDocs = [...docs, newDoc];

    try {
      await update(
        "projects",
        {
          id: project.id,
          data: {
            ...project,
            noc_documents: updatedDocs,
          },
          previousData: project,
        },
        { mutationMode: "optimistic" }
      );
      notify("Permit / NOC registered successfully", { type: "success" });
      onRefresh();
    } catch {
      notify("Failed to save document", { type: "error" });
    }
  };

  const filteredDocs = docs.filter((doc) => {
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.authority.toLowerCase().includes(q) ||
        doc.reference_no.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ProjectDocumentNOC["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Approved
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </Badge>
        );
      case "revision_required":
        return (
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Comments Issued
          </Badge>
        );
      case "pending_submission":
        return (
          <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-400 border-slate-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Submission
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Expired
          </Badge>
        );
    }
  };

  const approvedCount = docs.filter((d) => d.status === "approved").length;
  const underReviewCount = docs.filter((d) => d.status === "under_review" || d.status === "revision_required").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Row: Google Drive & Authority Hub Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Drive Card */}
        <Card className="border-border/60 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              Shared Project Workspace Drive
            </CardTitle>
            <CardDescription className="text-xs">
              Direct access to live CAD files, 3D Revit models, and stamped drawings.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => notify("Connecting to Google Drive Project Folder...", { type: "info" })}
              className="text-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Project Folder in Google Drive
            </Button>
          </CardContent>
        </Card>

        {/* UAE Authority Portals Link Card */}
        <Card className="border-border/60 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              UAE Authority Portal Shortcuts
            </CardTitle>
            <CardDescription className="text-xs">
              Quick launchpad to Dubai Municipality, DCD, DEWA, and developer portals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/portals">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch Authority Portals Hub ↗
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Control & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({docs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === "approved"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("under_review")}
              className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === "under_review"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Under Review ({underReviewCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drawings or reference #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Permit / Drawing
        </Button>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="p-8 text-center space-y-3">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No permit or drawing documents found</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Track building permits, Civil Defence NOCs, DEWA drawings, and community gate passes.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              Register First Permit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-border/60 hover:border-border transition-colors bg-card flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{doc.title}</span>
                    {getStatusBadge(doc.status)}
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {doc.category.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <strong className="text-foreground/90 font-medium">{doc.authority}</strong>
                    <span>·</span>
                    <span className="font-mono text-primary font-semibold">{doc.reference_no}</span>
                  </p>

                  {doc.notes && (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 px-2.5 py-1 rounded border border-border/30">
                      {doc.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    {doc.submission_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Submitted: {doc.submission_date}
                      </span>
                    )}
                    {doc.approval_date && (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Approved: {doc.approval_date}
                      </span>
                    )}
                    {doc.expiry_date && (
                      <span className="flex items-center gap-1">
                        Valid until: {doc.expiry_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={() => notify(`Opening document ${doc.reference_no}...`, { type: "info" })}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ({doc.file_type || "PDF"})
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDoc}
      />
    </div>
  );
};
