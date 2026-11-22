import { useState } from "react";
import { useUpdate, useNotify } from "ra-core";
import {
  User,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Building,
  Plus,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import type { Project, ProjectTeamMember } from "../types";

interface TeamTabProps {
  project: Project;
  onRefresh: () => void;
}

export const TeamTab = ({ project, onRefresh }: TeamTabProps) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const members = project.team_members || [];

  const handleAddMember = async (newMemberData: Omit<ProjectTeamMember, "id">) => {
    const newMember: ProjectTeamMember = {
      ...newMemberData,
      id: `tm-${Date.now()}`,
    };

    const updatedMembers = [...members, newMember];

    try {
      await update(
        "projects",
        {
          id: project.id,
          data: {
            ...project,
            team_members: updatedMembers,
          },
          previousData: project,
        },
        { mutationMode: "optimistic" }
      );
      notify("Team member added to project", { type: "success" });
      onRefresh();
    } catch {
      notify("Failed to add team member", { type: "error" });
    }
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Project Operational Roster & Key Stakeholders
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal engineers, architects, client representatives, and trade subcontractors.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Key Contact
        </Button>
      </div>

      {/* Team Roster Grid */}
      {members.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="p-8 text-center space-y-3">
            <User className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No team members assigned</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Assign project directors, site engineers, and client representatives to coordinate site delivery.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const cleanPhone = getCleanPhone(member.phone);
            const isClient = member.role.toLowerCase().includes("client");

            return (
              <Card
                key={member.id}
                className={`border transition-all ${
                  member.is_primary_contact
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                          {member.is_primary_contact && (
                            <span title="Primary Contact">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-xs font-medium text-foreground/80 mt-0.5">
                          {member.role}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        isClient
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {isClient ? "Client" : "Internal"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate font-medium text-foreground">{member.company}</span>
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}

                  {/* 1-click Quick Contact Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    {member.phone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${member.name}, Regarding Project ${project.reference_no} (${project.name})...`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {member.email && (
                      <a
                        href={`mailto:${member.email}?subject=${encodeURIComponent(
                          `Project ${project.reference_no} Coordination`
                        )}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
};
