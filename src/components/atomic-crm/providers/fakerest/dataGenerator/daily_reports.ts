import type { DailyReport } from "../../../types";
import type { Db } from "./types";
import { TEAM_MEMBERS } from "./sales";

export const generateDailyReports = (_db: Db): DailyReport[] => {
  const today = new Date().toISOString().split("T")[0];
  
  // Real daily reports matching UAE staff responsibilities
  const seedReports: Array<{
    userId: number;
    summary: string;
    blockers?: string;
    status: "submitted" | "draft";
    completed: number;
    pending: number;
    onHold: number;
    company: "goldland" | "abbadi" | "casavera";
  }> = [
    {
      userId: 4, // Rasiba (Senior Architect)
      summary: "Completed revised architectural elevation drawings for Palm Jumeirah Villa (GL-P-01). Sent to structural consultant for review.",
      status: "submitted",
      completed: 3,
      pending: 1,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 5, // Asma (Interior Design)
      summary: "Client moodboard presentation at Casavera studio for Downtown Luxury Penthouse (CV-P-01). Client approved walnut veneer and brushed brass finishes.",
      blockers: "Awaiting client sign-off on custom master bedroom joinery budget.",
      status: "submitted",
      completed: 2,
      pending: 2,
      onHold: 1,
      company: "casavera",
    },
    {
      userId: 6, // Faseela (Permitting Specialist)
      summary: "Submitted Dubai Municipality (DM) building permit application for Al Barsha Commercial Showroom. Coordinated civil defense comments.",
      status: "submitted",
      completed: 4,
      pending: 1,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 7, // Sadiq (Senior MEP Engineer)
      summary: "Completed DEWA electrical load test at Jumeirah Commercial Centre (AT-P-01). Verified cable sizing and main distribution board.",
      blockers: "DEWA site inspection slot not yet confirmed for Phase 2 energization.",
      status: "submitted",
      completed: 3,
      pending: 2,
      onHold: 1,
      company: "abbadi",
    },
    {
      userId: 8, // Arshad (Civil Site Engineer)
      summary: "Supervised concrete pouring for ground floor slab at Dubai Hills Villa. Slump test and cube samples taken.",
      status: "submitted",
      completed: 3,
      pending: 0,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 9, // Junaid (BDM)
      summary: "Conducted 4 client meetings across Business Bay and DIFC. Converted Luxury Villa renovation enquiry to Confirmed Deal (AED 650,000).",
      status: "submitted",
      completed: 4,
      pending: 2,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 10, // Samson (MEP Project Engineer)
      summary: "Chilled water piping leak testing completed at Dubai Hills Mansion. Pressure held at 12 bar for 24 hours.",
      status: "submitted",
      completed: 2,
      pending: 1,
      onHold: 0,
      company: "abbadi",
    },
    {
      userId: 11, // Mohamed (Technical Estimator)
      summary: "Finalized tender BOQ for luxury spa fit-out (AED 1.2M). Submitted pricing comparison sheet to Navas & Abrar.",
      status: "submitted",
      completed: 2,
      pending: 1,
      onHold: 0,
      company: "abbadi",
    },
    {
      userId: 12, // Danish (Estimation Engineer)
      summary: "Preparing joinery cut-list and material take-offs for Casavera retail showroom project.",
      status: "draft",
      completed: 1,
      pending: 3,
      onHold: 0,
      company: "casavera",
    },
    {
      userId: 13, // Shafi (Site Supervisor)
      summary: "Materials delivery received at Palm Jumeirah site. Scaffolding safety clearance verified by third party.",
      status: "submitted",
      completed: 3,
      pending: 1,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 14, // Ahmed (Junior BD)
      summary: "Followed up with 15 inbound web leads. Scheduled 3 site survey appointments for Arshad and Junaid.",
      status: "submitted",
      completed: 4,
      pending: 1,
      onHold: 0,
      company: "goldland",
    },
    {
      userId: 15, // Aysha (Digital Marketing)
      summary: "Meta advertising campaign performance report compiled: 42 new qualified enquiries in the last 7 days.",
      status: "submitted",
      completed: 2,
      pending: 1,
      onHold: 0,
      company: "casavera",
    },
    {
      userId: 16, // Javed (3D Visualizer)
      summary: "Generated 4 high-resolution 4K 3D renders for the Emirates Hills luxury villa lounge and master suite.",
      status: "submitted",
      completed: 3,
      pending: 0,
      onHold: 0,
      company: "casavera",
    },
  ];

  return seedReports.map((item, index) => {
    const member = TEAM_MEMBERS.find((m) => m.id === item.userId);
    const fullName = member ? `${member.first_name} ${member.last_name}` : `Staff #${item.userId}`;
    const role = member?.role_name || member?.job_title || "Team Member";

    return {
      id: index + 1,
      user_id: item.userId,
      user_name: fullName,
      user_role: role,
      operating_company: item.company,
      report_date: today,
      status: item.status,
      summary: item.summary,
      blockers: item.blockers,
      submitted_at: `${today}T17:${15 + index}:00.000Z`,
      tasks_completed_count: item.completed,
      tasks_pending_count: item.pending,
      tasks_on_hold_count: item.onHold,
    };
  });
};
