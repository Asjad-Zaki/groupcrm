import { add } from "date-fns";
import {
  defaultDealStages,
} from "../../../root/defaultConfiguration";
import type { Deal } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const UAE_SAMPLE_LEADS = [
  // Goldland Contracting LLC (Approvals, Engineering & Fit-out)
  {
    name: "DDA Authority Approval - Business Bay Commercial Tower",
    category: "authority-approvals",
    amount: 65000,
    stage: "UNDER_FOLLOW_UP",
    description: "Dubai Development Authority (DDA) structural and architectural approval for commercial office fit-out floors 14 to 16.",
  },
  {
    name: "Dubai Municipality Permitting - Al Quoz Warehouse Facility",
    category: "authority-approvals",
    amount: 120000,
    stage: "WARM",
    description: "Civil defense (DCD) and DM change of activity approvals for logistics warehouse conversion.",
  },
  {
    name: "Nakheel Developer Approval - Palm Jumeirah Villa Extension",
    category: "authority-approvals",
    amount: 85000,
    stage: "HOT",
    description: "Architectural drawings and Nakheel permits for 2-storey beachfront villa annex.",
  },
  {
    name: "Retail Flagship Fit-out Permit - Dubai Mall Fashion Avenue",
    category: "commercial-fitout",
    amount: 250000,
    stage: "WON",
    description: "Full turnkey fit-out permit and MEP review for 3,500 sq ft luxury retail store.",
  },
  {
    name: "Trakhees Approval & Drawings - JAFZA Warehouse Extension",
    category: "architecture-design",
    amount: 95000,
    stage: "INITIATED",
    description: "Trakhees CED submission for structural modification and mezzanines.",
  },
  {
    name: "DCD Fire Safety Revision - JLT Cluster V Office Tower",
    category: "authority-approvals",
    amount: 45000,
    stage: "NEW",
    description: "Dubai Civil Defense sprinkler and emergency exit compliance certificate.",
  },
  {
    name: "Commercial Fit-out Authority Signoff - DIFC Gate Precinct",
    category: "commercial-fitout",
    amount: 175000,
    stage: "UNDER_FOLLOW_UP",
    description: "DIFC authority approval and fit-out execution for private equity office.",
  },

  // Abbadi Tech Technical Services LLC (MEP, Electrical, HVAC)
  {
    name: "Full Villa MEP Upgrade & DEWA Load Enhancement - Emirates Hills",
    category: "electrical-mep",
    amount: 180000,
    stage: "WARM",
    description: "DEWA electrical load sanction, main distribution boards upgrade, and smart villa cabling.",
  },
  {
    name: "HVAC Chiller Overhaul & Maintenance Contract - Deira Tower",
    category: "hvac-maintenance",
    amount: 95000,
    stage: "HOT",
    description: "Annual preventive maintenance contract for 3 roof chillers and 48 fan coil units.",
  },
  {
    name: "Commercial Plumbing & Drainage Network - Al Barsha Hotel",
    category: "plumbing-drainage",
    amount: 140000,
    stage: "UNDER_FOLLOW_UP",
    description: "Replacement of central water filtration, booster pumps, and kitchen greywater piping.",
  },
  {
    name: "Commercial AC Ducting & Electrical Fit-out - JLT Cluster W",
    category: "hvac-maintenance",
    amount: 55000,
    stage: "NEW",
    description: "Fresh air supply, return ducting, and VAV box balancing for corporate floor.",
  },
  {
    name: "Annual MEP Maintenance Contract - Dubai Hills Estate Compound",
    category: "electrical-mep",
    amount: 210000,
    stage: "WON",
    description: "Contract signed for 24-villa compound MEP, plumbing, and electrical emergency response.",
  },
  {
    name: "Industrial Power Substation Maintenance - Al Qusais",
    category: "electrical-mep",
    amount: 115000,
    stage: "INITIATED",
    description: "Testing of 11kV switchgear, transformer oil filtration, and thermal imaging report.",
  },
  {
    name: "Emergency Drainage Sump Pump Replacement - Dubai Marina",
    category: "plumbing-drainage",
    amount: 38000,
    stage: "COLD",
    description: "Basement parking sump pump replacement. Postponed to next budget review.",
  },

  // Casavera Interiors LLC (Luxury Interior Fit-out & Renovation)
  {
    name: "Luxury Penthouse Turnkey Interior Fit-out - Downtown Dubai",
    category: "luxury-interiors",
    amount: 450000,
    stage: "HOT",
    description: "Complete turnkey design and build: Italian marble flooring, bespoke ceiling, smart lighting.",
  },
  {
    name: "Bespoke Joinery & Custom Furniture Delivery - Palm Jumeirah Villa",
    category: "villa-renovation",
    amount: 280000,
    stage: "WARM",
    description: "Custom walk-in wardrobes, luxury vanity units, kitchen cabinetry, and walnut wall cladding.",
  },
  {
    name: "Modern Minimalist 3D Concept & BOQ - Jumeirah Golf Estates",
    category: "luxury-interiors",
    amount: 60000,
    stage: "INITIATED",
    description: "Full interior design concept, material board, photorealistic 3D renders, and detailed BOQ.",
  },
  {
    name: "Boutique Executive Office Renovation - DIFC Index Tower",
    category: "commercial-fitout",
    amount: 320000,
    stage: "UNDER_FOLLOW_UP",
    description: "Acoustic glass partitions, executive boardroom, custom reception desk, and designer flooring.",
  },
  {
    name: "Full Villa Renovation & Handover - Arabian Ranches III",
    category: "villa-renovation",
    amount: 550000,
    stage: "WON",
    description: "Turnkey handover: open plan kitchen expansion, bathroom remodeling, and pergola joinery.",
  },
  {
    name: "Luxury Beauty Spa & Salon Concept - City Walk Dubai",
    category: "commercial-fitout",
    amount: 190000,
    stage: "COLD",
    description: "Client requested concept and quotation; landlord fitout guidelines pending revision.",
  },
  {
    name: "Duplex Apartment Interior Staging - Bluewaters Island",
    category: "luxury-interiors",
    amount: 75000,
    stage: "NEW",
    description: "Turnkey luxury staging and custom loose furniture package for high-end rental property.",
  },
];

export const generateDeals = (db: Db): Deal[] => {
  const deals: Deal[] = UAE_SAMPLE_LEADS.map((item, id) => {
    const company = db.companies[id % db.companies.length] ?? db.companies[0];
    company.nb_deals = (company.nb_deals ?? 0) + 1;

    const contacts = db.contacts.filter((c) => c.company_id === company.id);
    const assignedSales = db.sales[id % db.sales.length] ?? db.sales[0];

    const created_at = randomDate(new Date(2026, 8, 1)).toISOString();
    const expected_closing_date = randomDate(
      new Date(2026, 11, 1),
      add(new Date(2026, 11, 1), { months: 3 }),
    )
      .toISOString()
      .split("T")[0];

    const tenant_id = id < 7 ? 1 : id < 14 ? 2 : 3;
    const isHighRisk = id === 2 || id === 8 || id === 17;
    const risk_reason =
      id === 2
        ? "Nakheel developer guidelines update pending"
        : id === 8
          ? "Chiller supply delay from Europe"
          : id === 17
            ? "Acoustic glazing permit requires DIFC structural reassessment"
            : undefined;

    // Follow-up SLAs: id 0, 7, 14 are overdue (yesterday); id 1, 9, 15 are upcoming
    const today = new Date();
    const overdueDate = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const upcomingDate = new Date(today.getTime() + 48 * 60 * 60 * 1000).toISOString().split("T")[0];
    const next_followup_at =
      id === 0 || id === 7 || id === 14
        ? overdueDate
        : id === 1 || id === 9 || id === 15
          ? upcomingDate
          : undefined;

    return {
      id,
      name: item.name,
      company_id: company.id,
      tenant_id,
      high_risk: isHighRisk,
      risk_reason,
      next_followup_at,
      contact_ids: contacts.slice(0, 2).map((c) => c.id),
      categories: [item.category],
      stage: item.stage,
      description: item.description,
      amount: item.amount,
      created_at,
      updated_at: created_at,
      expected_closing_date,
      sales_id: assignedSales.id,
      index: 0,
    };
  });

  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        deal.index = index;
      });
  });

  return deals;
};
