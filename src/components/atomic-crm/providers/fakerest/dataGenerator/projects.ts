import type { Db } from "./types";
import type { Project, ProjectMilestone } from "../../../types";

export const GOLDLAND_STAGES = [
  "Authority / Developer Identification",
  "Requirements and Drawings",
  "Submission",
  "Authority Comments",
  "Revisions",
  "Inspection Coordination",
  "Approval / Closure",
];

export const ABBADI_STAGES = [
  "Enquiry Received",
  "Site Visit & Inspection",
  "Scope Definition",
  "Quotation & Approval",
  "Work Assignment",
  "Technical Execution",
  "Site Testing & Report",
  "Completion / Invoicing",
];

export const CASAVERA_STAGES = [
  "Enquiry & Client Brief",
  "Site Visit & Survey",
  "Concept & 3D Interior Design",
  "BOQ & Quotation",
  "Client Material Approval",
  "Turnkey Execution",
  "Progress Reviews & Variations",
  "Client Handover",
];

const createMilestones = (
  stages: string[],
  completedCount: number
): ProjectMilestone[] => {
  return stages.map((title, idx) => ({
    id: `m-${idx + 1}`,
    title,
    completed: idx < completedCount,
    completed_at: idx < completedCount ? "2026-10-15" : undefined,
    due_date: "2026-12-01",
  }));
};

export const generateProjects = (db: Db): Project[] => {
  const projects: Project[] = [
    // 1. Goldland Contracting LLC (Approvals & Engineering)
    {
      id: 1,
      reference_no: "GL-PRJ-2026-001",
      name: "Retail Flagship Fit-out Permit - Dubai Mall Fashion Avenue",
      tenant_id: 1,
      deal_id: 3,
      company_id: db.companies[0]?.id ?? 1,
      engineer_id: 4, // Arshad (Site Inspection Engineer)
      status: "in_progress",
      current_stage: "Inspection Coordination",
      progress_percent: 75,
      contract_value: 250000,
      start_date: "2026-09-01",
      target_completion_date: "2026-12-15",
      site_location: "Fashion Avenue, Dubai Mall, Downtown Dubai",
      scope_summary: "Dubai Municipality and Emaar approvals for 3,500 sq ft luxury boutique retail fit-out.",
      milestones: createMilestones(GOLDLAND_STAGES, 5),
      created_at: "2026-09-01T08:00:00Z",
      updated_at: "2026-11-10T14:30:00Z",
    },
    {
      id: 2,
      reference_no: "GL-PRJ-2026-002",
      name: "DDA Commercial Tower Approval - Business Bay",
      tenant_id: 1,
      deal_id: 0,
      company_id: db.companies[1]?.id ?? 2,
      engineer_id: 0, // Navas (Operations / MD / Consultant)
      status: "in_progress",
      current_stage: "Authority Comments",
      progress_percent: 45,
      contract_value: 65000,
      start_date: "2026-10-01",
      target_completion_date: "2026-12-30",
      site_location: "Cluster 4, Business Bay, Dubai",
      scope_summary: "Dubai Development Authority (DDA) structural review and MEP clearance for 3 floors.",
      milestones: createMilestones(GOLDLAND_STAGES, 3),
      created_at: "2026-10-01T09:00:00Z",
      updated_at: "2026-11-08T11:00:00Z",
    },

    // 2. Abbadi Tech Technical Services LLC (MEP & Technical Operations)
    {
      id: 3,
      reference_no: "AT-PRJ-2026-001",
      name: "Compound MEP Annual Maintenance - Dubai Hills Estate",
      tenant_id: 2,
      deal_id: 11,
      company_id: db.companies[2]?.id ?? 3,
      engineer_id: 2, // Junaid (Site Engineer)
      status: "in_progress",
      current_stage: "Technical Execution",
      progress_percent: 60,
      contract_value: 210000,
      start_date: "2026-08-15",
      target_completion_date: "2027-08-15",
      site_location: "Maple 2, Dubai Hills Estate, Dubai",
      scope_summary: "Complete MEP quarterly preventive maintenance for 24 luxury residential villas.",
      milestones: createMilestones(ABBADI_STAGES, 5),
      created_at: "2026-08-15T07:30:00Z",
      updated_at: "2026-11-12T16:00:00Z",
    },
    {
      id: 4,
      reference_no: "AT-PRJ-2026-002",
      name: "DEWA Load Enhancement & Substation Upgrade - Emirates Hills",
      tenant_id: 2,
      deal_id: 7,
      company_id: db.companies[3]?.id ?? 4,
      engineer_id: 2, // Junaid (Site Engineer)
      status: "in_progress",
      current_stage: "Work Assignment",
      progress_percent: 40,
      contract_value: 180000,
      start_date: "2026-10-10",
      target_completion_date: "2027-01-20",
      site_location: "Sector P, Emirates Hills, Dubai",
      scope_summary: "DEWA 350kW power enhancement, main distribution panel upgrade and smart home cabling.",
      milestones: createMilestones(ABBADI_STAGES, 4),
      created_at: "2026-10-10T10:00:00Z",
      updated_at: "2026-11-14T09:15:00Z",
    },

    // 3. Casavera Interiors LLC (Luxury Interior Fit-out & Renovation)
    {
      id: 5,
      reference_no: "CV-PRJ-2026-001",
      name: "Turnkey Luxury Villa Renovation - Arabian Ranches III",
      tenant_id: 3,
      deal_id: 18,
      company_id: db.companies[4]?.id ?? 5,
      engineer_id: 4, // Arshad (Site Engineer)
      status: "in_progress",
      current_stage: "Turnkey Execution",
      progress_percent: 70,
      contract_value: 550000,
      start_date: "2026-08-01",
      target_completion_date: "2026-12-20",
      site_location: "Sun Cluster, Arabian Ranches III, Dubai",
      scope_summary: "Turnkey luxury fit-out: marble flooring, custom walnut joinery, smart home automation, luxury kitchen.",
      milestones: createMilestones(CASAVERA_STAGES, 5),
      created_at: "2026-08-01T08:00:00Z",
      updated_at: "2026-11-13T17:00:00Z",
    },
    {
      id: 6,
      reference_no: "CV-PRJ-2026-002",
      name: "Luxury Penthouse Interior Staging - Downtown Dubai",
      tenant_id: 3,
      deal_id: 14,
      company_id: db.companies[5]?.id ?? 6,
      engineer_id: 1, // Abrar (Operations / MD)
      status: "in_progress",
      current_stage: "Client Material Approval",
      progress_percent: 50,
      contract_value: 450000,
      start_date: "2026-09-15",
      target_completion_date: "2027-01-30",
      site_location: "Il Primo Tower, Opera District, Downtown Dubai",
      scope_summary: "Italian marble feature wall, bespoke ceiling details, brass metalwork, and imported Italian furniture.",
      milestones: createMilestones(CASAVERA_STAGES, 4),
      created_at: "2026-09-15T09:30:00Z",
      updated_at: "2026-11-11T12:00:00Z",
    },
  ];

  return projects;
};

