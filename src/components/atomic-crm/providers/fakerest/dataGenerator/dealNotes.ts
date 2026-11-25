import type { Db } from "./types";

const REALISTIC_UAE_DEAL_NOTES: string[] = [
  "Tender submission completed on time. Commercial proposal submitted along with 5% bid bond guarantee.",
  "Client confirmed budget approval of AED 180,000 for DEWA load enhancement. Awaiting formal LPO issuance.",
  "Clarification meeting held with client procurement manager. Addressed queries regarding MEP equipment warranty and maintenance period.",
  "Submitted revised commercial offer with adjusted milestone payment schedule (20% advance, 70% progress, 10% retention upon completion).",
  "Site survey completed with structural consultant. Clarified floor load capacity for server room racks.",
  "Client requested sample finish for acoustic slatted wood panelling. Physical mock-up delivered to DIFC office.",
  "Commercial contract draft reviewed by legal advisor. Minor indemnification clauses updated and returned to client.",
  "Received client letter of intent (LOI). Site possession scheduled for next Monday following landlord induction.",
  "Landlord fit-out guidelines revised. Updated BOQ pricing submitted to client for review and sign-off.",
  "Final contract signed at executive management meeting. Project kick-off meeting scheduled with operations team.",
  "Reviewed subcontractor bids for HVAC duct fabrication. Selected preferred vendor with 10-year warranty.",
  "Client requested 5% discount on MEP equipment packages. Negotiated trade-off with extended preventive maintenance contract.",
  "Authority pre-check completed on Dubai Municipality portal. No objections noted on structural layout drawings.",
  "Prepared interim payment certificate (IPC #1) based on completed site mobilization and safety hoarding.",
  "Completed 3D photorealistic renderings for executive boardroom. Presented to client managing director with full approval.",
  "Client verified bank guarantee details. Mobilization advance payment scheduled for release by Monday.",
  "Conducted joint site walkthrough with landlord technical manager. MEP hookup points and drainage risers confirmed.",
  "Submitted value engineering alternatives for ceramic tiles and acoustic baffles, reducing overall project cost by 4.8%.",
  "Received conditional NOC from Dubai Civil Defense (DCD). Addressing minor comment on emergency exit light lux level.",
  "All commercial terms finalized. Contract execution copies exchanged and signed by authorized signatories.",
];

export const generateDealNotes = (db: Db) => {
  const notesCount = REALISTIC_UAE_DEAL_NOTES.length;
  const now = new Date();

  return Array.from(Array(notesCount).keys()).map((id) => {
    // Map evenly across deals to eliminate duplicates
    const deal = db.deals[id % db.deals.length];

    // Realistic recent dates (hours/days ago)
    const hoursAgo = id * 5 + 2;
    const noteDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    return {
      id,
      deal_id: deal.id,
      text: REALISTIC_UAE_DEAL_NOTES[id % REALISTIC_UAE_DEAL_NOTES.length],
      date: noteDate.toISOString(),
      sales_id: deal.sales_id,
    };
  });
};
