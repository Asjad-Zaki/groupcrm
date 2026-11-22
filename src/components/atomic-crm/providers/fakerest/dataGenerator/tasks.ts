import { defaultTaskTypes } from "../../../root/defaultConfiguration";
import type { Task } from "../../../types";
import type { Db } from "./types";
import { TEAM_MEMBERS } from "./sales";

// Real UAE Daily Tasks for Personas
const REALISTIC_PERSONA_TASKS: Array<{
  userId: number;
  company: "goldland" | "abbadi" | "casavera";
  project: string;
  text: string;
  priority: "critical" | "urgent" | "high" | "normal";
  status: "pending" | "in_progress" | "completed" | "on_hold";
  carriedOver: number;
  holdReason?: string;
  type: string;
}> = [
  // Navas (MD)
  {
    userId: 0,
    company: "goldland",
    project: "Palm Jumeirah Villa Extension (GL-P-01)",
    text: "Review contractor payment certificate #3 and release subcontractor payment",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "meeting",
  },
  {
    userId: 0,
    company: "abbadi",
    project: "Jumeirah Commercial Centre MEP (AT-P-01)",
    text: "Executive sign-off on DEWA load sanction guarantee deposit",
    priority: "high",
    status: "in_progress",
    carriedOver: 0,
    type: "follow-up",
  },
  // Zaki (IT Admin)
  {
    userId: 1,
    company: "goldland",
    project: "Digital Systems & Infrastructure",
    text: "Verify automated nightly database backups and test disaster recovery snapshot",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 1,
    company: "casavera",
    project: "Casavera Design Studio Digital Hub",
    text: "Configure new staff MFA tokens and audit access review log",
    priority: "normal",
    status: "pending",
    carriedOver: 1,
    type: "follow-up",
  },
  // Rabeeh (Finance)
  {
    userId: 2,
    company: "goldland",
    project: "Group Financial Controls",
    text: "Verify initial 10% advance payment receipt for new Al Barsha South deal (AED 85,000)",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 2,
    company: "abbadi",
    project: "Abbadi Tech Operations",
    text: "Reconcile supplier invoices for copper piping and HVAC electrical switchgear",
    priority: "normal",
    status: "in_progress",
    carriedOver: 0,
    type: "follow-up",
  },
  // Abrar (General Manager)
  {
    userId: 3,
    company: "goldland",
    project: "Operations Oversight",
    text: "Conduct daily operational standup with site supervisors and review blocker reports",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "meeting",
  },
  {
    userId: 3,
    company: "casavera",
    project: "Downtown Penthouse (CV-P-01)",
    text: "Coordinate with client representative regarding joinery material delivery schedule",
    priority: "high",
    status: "in_progress",
    carriedOver: 0,
    type: "call",
  },
  // Rasiba (Senior Architect)
  {
    userId: 4,
    company: "goldland",
    project: "Palm Jumeirah Villa Extension (GL-P-01)",
    text: "Revise staircase structural opening drawing per consultant comments",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 4,
    company: "goldland",
    project: "Al Barsha South Commercial Showroom",
    text: "Prepare elevation renders and material schedule for Dubai Municipality submission",
    priority: "high",
    status: "in_progress",
    carriedOver: 1,
    type: "follow-up",
  },
  {
    userId: 4,
    company: "casavera",
    project: "Emirates Hills Luxury Residence",
    text: "Complete detailed 3D BOQ for custom walk-in wardrobe joinery",
    priority: "normal",
    status: "pending",
    carriedOver: 0,
    type: "follow-up",
  },
  // Asma (Interior Designer)
  {
    userId: 5,
    company: "casavera",
    project: "Downtown Luxury Penthouse (CV-P-01)",
    text: "Client moodboard presentation at Casavera studio - present marble and brass selection",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "meeting",
  },
  {
    userId: 5,
    company: "casavera",
    project: "Palm Jumeirah Royal Villa Fit-out",
    text: "Obtain client formal sign-off on lighting and false ceiling acoustic drawings",
    priority: "high",
    status: "on_hold",
    carriedOver: 2,
    holdReason: "Client traveling overseas until Wednesday; sign-off rescheduled",
    type: "call",
  },
  {
    userId: 5,
    company: "casavera",
    project: "City Walk Boutique Retail Fit-out",
    text: "Coordinate with Italian furniture supplier regarding air-freight tracking for VIP lounge",
    priority: "normal",
    status: "in_progress",
    carriedOver: 0,
    type: "email",
  },
  // Faseela (Permitting Specialist)
  {
    userId: 6,
    company: "goldland",
    project: "Al Barsha Commercial Showroom",
    text: "Upload revised architectural package into Dubai Municipality (DM) portal",
    priority: "critical",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 6,
    company: "goldland",
    project: "Dubai South Logistics Hub",
    text: "Follow up with Dubai Civil Defence (DCD) officer on fire protection NOC",
    priority: "urgent",
    status: "in_progress",
    carriedOver: 1,
    type: "call",
  },
  {
    userId: 6,
    company: "abbadi",
    project: "Jumeirah Commercial Centre MEP (AT-P-01)",
    text: "Submit single line diagram (SLD) revision on DEWA e-Services portal",
    priority: "high",
    status: "pending",
    carriedOver: 0,
    type: "follow-up",
  },
  // Sadiq (Senior MEP Project Engineer)
  {
    userId: 7,
    company: "abbadi",
    project: "Jumeirah Commercial Centre MEP (AT-P-01)",
    text: "Perform DEWA electrical load inspection on distribution board #4",
    priority: "critical",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 7,
    company: "abbadi",
    project: "Al Quoz Industrial Warehouse MEP",
    text: "Supervise primary copper piping pressure testing (hold at 10 bar for 4 hours)",
    priority: "high",
    status: "in_progress",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 7,
    company: "abbadi",
    project: "Business Bay Corporate Office",
    text: "Finalize air balancing report for chilled water fan coil units (FCUs)",
    priority: "urgent",
    status: "on_hold",
    carriedOver: 1,
    holdReason: "Awaiting main contractor to restore temporary site power",
    type: "follow-up",
  },
  // Arshad (Civil Site Engineer)
  {
    userId: 8,
    company: "goldland",
    project: "Palm Jumeirah Villa Extension (GL-P-01)",
    text: "Inspect steel reinforcement rebar before slab concrete pouring at 07:00 AM",
    priority: "critical",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 8,
    company: "goldland",
    project: "Dubai Hills Villa Substructure",
    text: "Supervise soil compaction test with third-party testing laboratory",
    priority: "high",
    status: "in_progress",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 8,
    company: "goldland",
    project: "Jumeirah Islands Boundary Wall",
    text: "Check perimeter boundary wall waterproofing and backfilling clearance",
    priority: "normal",
    status: "pending",
    carriedOver: 2,
    type: "follow-up",
  },
  // Junaid (BDM)
  {
    userId: 9,
    company: "goldland",
    project: "Business Bay Commercial Tower",
    text: "Present turn-key fit-out proposal to corporate tenant representative",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "meeting",
  },
  {
    userId: 9,
    company: "goldland",
    project: "Palm Jumeirah Villa Enquiries",
    text: "Call new high-risk luxury lead regarding structural modification feasibility",
    priority: "urgent",
    status: "in_progress",
    carriedOver: 0,
    type: "call",
  },
  // Samson (MEP Project Engineer)
  {
    userId: 10,
    company: "abbadi",
    project: "Dubai Hills Mansion MEP",
    text: "Inspect drainage slope and conduct flood test on wet areas",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  {
    userId: 10,
    company: "abbadi",
    project: "Jumeirah Commercial Centre MEP",
    text: "Verify installation of fire dampers in HVAC main supply ducts",
    priority: "normal",
    status: "pending",
    carriedOver: 0,
    type: "follow-up",
  },
  // Mohamed (Technical Estimator)
  {
    userId: 11,
    company: "abbadi",
    project: "Luxury Spa Fit-out Tender",
    text: "Calculate quantities and supplier rates for MEP switchgear and heat exchangers",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  // Danish (Estimation Engineer)
  {
    userId: 12,
    company: "casavera",
    project: "Retail Showroom Fit-out",
    text: "Prepare joinery BOQ cut-lists and veneer sheet counts",
    priority: "normal",
    status: "in_progress",
    carriedOver: 1,
    type: "follow-up",
  },
  // Shafi (Site Supervisor)
  {
    userId: 13,
    company: "goldland",
    project: "Palm Jumeirah Villa Extension",
    text: "Verify site PPE compliance, toolbox talk attendance, and material delivery receipt",
    priority: "urgent",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  // Ahmed (Junior BD)
  {
    userId: 14,
    company: "goldland",
    project: "Lead Inbound Qualification",
    text: "Contact 12 inbound WhatsApp enquiries and qualify project budget in AED",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "call",
  },
  // Aysha (Digital Marketing)
  {
    userId: 15,
    company: "casavera",
    project: "Social & Digital Inquiries",
    text: "Publish weekly completed project showcase reel on Instagram & LinkedIn",
    priority: "normal",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
  // Javed (3D Visualizer)
  {
    userId: 16,
    company: "casavera",
    project: "Emirates Hills Residence",
    text: "Finalize photorealistic lighting renders for double-height foyer",
    priority: "high",
    status: "completed",
    carriedOver: 0,
    type: "follow-up",
  },
];

export const generateTasks = (db: Db): Task[] => {
  const today = new Date().toISOString().split("T")[0];
  const contactList = db.contacts || [];

  return REALISTIC_PERSONA_TASKS.map<Task>((item, idx) => {
    const member = TEAM_MEMBERS.find((m) => m.id === item.userId);
    const contact = contactList[idx % (contactList.length || 1)];

    if (contact) {
      contact.nb_tasks = (contact.nb_tasks ?? 0) + 1;
    }

    const projectId =
      item.company === "goldland"
        ? (idx % 2) + 1
        : item.company === "abbadi"
          ? (idx % 2) + 3
          : (idx % 2) + 5;

    return {
      id: idx + 1,
      contact_id: contact?.id ?? null,
      project_id: projectId,
      tenant_id: item.company === "goldland" ? 1 : item.company === "abbadi" ? 2 : 3,
      operating_company: item.company,
      sales_id: item.userId,
      owner_id: item.userId,
      creator_id: 3, // Abrar (GM) or Navas (MD)
      assignee_name: member ? `${member.first_name} ${member.last_name}` : "Team Member",
      project_name: item.project,
      type: item.type || defaultTaskTypes[0].value,
      text: item.text,
      status: item.status,
      hold_reason: item.holdReason,
      carried_over_count: item.carriedOver,
      priority: item.priority,
      task_date: today,
      due_date: `${today}T18:00:00.000Z`,
      done_date: item.status === "completed" ? `${today}T16:30:00.000Z` : undefined,
      created_at: new Date(Date.now() - (item.carriedOver + 1) * 86400000).toISOString(),
    };
  });
};
