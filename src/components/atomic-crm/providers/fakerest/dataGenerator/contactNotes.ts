import { defaultNoteStatuses } from "../../../root/defaultConfiguration";
import type { ContactNote } from "../../../types";
import type { Db } from "./types";

const REALISTIC_UAE_CONTACT_NOTES: string[] = [
  "Conducted site coordination meeting at Business Bay. Confirmed MEP rough-in schedule and primary substation tie-in dates with client engineering team.",
  "Received approved shop drawings for executive tower podium joinery. Handed over physical mock-up samples for final client sign-off.",
  "Reviewed acoustic wall panel specifications with project consultant. DCD fire safety certificate submitted for approval.",
  "Finalized material submittal package for luxury suites. Sample board approved with minor comments on brushed brass trim finish.",
  "Site inspection completed for high-rise commercial floor fit-out. HVAC duct pressure test witnessed and certified by supervising consultant.",
  "Advance payment guarantee submitted to client commercial accounts. Initial site mobilisation notice issued to operations team.",
  "Reviewed revised architectural ceiling layout reflecting acoustic baffle details. Variations logged in tracking register.",
  "Held progress review with facilities team. All health & safety permits cleared for scheduled night shift works.",
  "Nakheel developer approval letter received for Palm Jumeirah villa beachfront extension. Structural calculation sheets verified.",
  "Site visit conducted with coastal authority inspector. Boundary wall reinforcement and marine setback approved.",
  "Festival City commercial retail unit fit-out review: landlord MEP technical compliance matrix approved with zero non-conformances.",
  "Coordinated with retail delivery team for cold shell handover inspection. Meter location and power feeder point agreed.",
  "City Walk retail expansion: DDA and civil defense permits received. Emergency lighting and smoke damper testing scheduled.",
  "Conducted landlord coordination meeting regarding grease trap capacity and kitchen exhaust duct fire wrap routing.",
  "DIFC Gate Precinct private equity headquarters: acoustic glass partition testing completed at 48dB rating. Full compliance confirmed.",
  "Security access control and structured cabling integration verified with DIFC property management engineers.",
  "Wasl Al Kifaf residential development: scheduled inspection for chilled water riser valve replacement. Logistics clearance obtained.",
  "Completed snagging report for 8 apartment renovations. Joinery and sanitaryware sign-offs collected.",
  "Palm Jumeirah luxury resort: HVAC chiller overhaul phase 2 completed. Commissioning report signed by resort chief engineer.",
  "Emergency drainage pump replacement completed in basement B2 plant room. Handover certificate signed.",
  "Tilal Al Ghaf show villa fit-out: bespoke joinery installations, custom veneer wardrobes, and marble vanity units completed.",
  "Landscaping irrigation and outdoor lighting circuit approved by community engineering management.",
  "Dubai Marina waterfront penthouse: marble flooring installation completed. Protective sheeting installed ahead of decorative paint works.",
  "Smart home automation system rack commissioning completed. Client representative verified lighting scenes and motorized blinds.",
  "Meydan commercial block: fire alarm interface testing completed with Dubai Civil Defense (DCD). NOC issued.",
  "Progress billing certificate #4 approved by client quantity surveyor for electrical installations.",
  "Logistics warehouse facility: DEWA main distribution board energisation completed. Single line diagram updated and signed.",
  "Civil defense final building completion certificate received for cold storage logistics zone.",
  "Yas Island commercial showroom: Trakhees & Abu Dhabi municipality approvals synchronized. Site setup commenced.",
  "Contractor payment certificate #2 processed and submitted to commercial department.",
  "Client confirmed receipt of the revised DEWA single line diagram and requested submission through the online portal.",
  "Conducted preliminary site inspection at Business Bay. Landlord NOC received and MEP rough-in scheduled.",
  "Commercial negotiation completed for Palm Jumeirah villa fit-out. Contract draft sent for legal review and signature.",
  "Variation order #2 approved by client representative for extra ceiling bulkhead detailing.",
  "Held coordination meeting with electrical subcontractor for testing and commissioning of 11kV switchgear.",
  "Client confirmed 30-day payment milestone terms instead of 15 days; approved by Finance Director.",
  "Site survey completed with structural consultant. Clarification sent regarding floor load capacity in server room.",
  "Final contract signing scheduled for next Tuesday at DIFC Gate Building offices.",
  "Delivered physical wood veneer and Italian marble samples for client executive board presentation.",
  "Civil defense sprinkler head relocation completed and tested under pressure for flagship retail store.",
];

export const generateContactNotes = (db: Db): ContactNote[] => {
  const notesCount = REALISTIC_UAE_CONTACT_NOTES.length;
  const now = new Date();

  return Array.from(Array(notesCount).keys()).map((id) => {
    // Map evenly across contacts to eliminate unwanted duplicate records
    const contact = db.contacts[id % db.contacts.length];

    // Create realistic recent timestamps (from today backwards in hours/days)
    const hoursAgo = id * 3.5 + 1; // 1h ago, 4.5h ago, 8h ago, etc.
    const noteDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    contact.last_seen =
      noteDate.toISOString() > contact.last_seen
        ? noteDate.toISOString()
        : contact.last_seen;

    return {
      id,
      contact_id: contact.id,
      text: REALISTIC_UAE_CONTACT_NOTES[
        id % REALISTIC_UAE_CONTACT_NOTES.length
      ],
      date: noteDate.toISOString(),
      sales_id: contact.sales_id!,
      status: defaultNoteStatuses[id % defaultNoteStatuses.length].value,
    };
  });
};
