import { defaultNoteStatuses } from "../../../root/defaultConfiguration";
import type { Contact, Tag } from "../../../types";
import type { Db } from "./types";
import { randomDate, weightedBoolean } from "./utils";

export interface UaeContactSeed {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  title: string;
  companyIndex: number;
  email: string;
  phone: string;
  background: string;
}

export const UAE_CONTACT_SEEDS: UaeContactSeed[] = [
  {
    firstName: "Tariq",
    lastName: "Al Falasi",
    gender: "male",
    title: "Director of Commercial Development",
    companyIndex: 0, // Al Futtaim Properties LLC
    email: "tariq.falasi@futtaim.ae",
    phone: "+971 50 248 1902",
    background:
      "Leads commercial office expansions and tenant lease fit-out guidelines at Dubai Festival City.",
  },
  {
    firstName: "Sarah",
    lastName: "Kensington",
    gender: "female",
    title: "Senior Hospitality Project Director",
    companyIndex: 1, // Emaar Hospitality Group
    email: "sarah.kensington@emaar.ae",
    phone: "+971 52 839 4018",
    background:
      "Oversees luxury hotel guestroom refurbishments and bespoke interior installations across Downtown Dubai.",
  },
  {
    firstName: "Rashid",
    lastName: "Al Nuaimi",
    gender: "male",
    title: "VP Engineering & Construction",
    companyIndex: 2, // DAMAC Luxury Developments
    email: "rashid.nuaimi@damacgroup.com",
    phone: "+971 50 519 2831",
    background:
      "Senior engineering leader coordinating tower shell & core completions and contractor technical approvals in Business Bay.",
  },
  {
    firstName: "Elena",
    lastName: "Rostova",
    gender: "female",
    title: "Head of Interior Architecture & Design",
    companyIndex: 3, // Sobha Realty Commercial
    email: "elena.rostova@sobha.ae",
    phone: "+971 55 617 3829",
    background:
      "Directs luxury architectural finishes, material selection boards, and joinery quality audits at Sobha Hartland.",
  },
  {
    firstName: "Mohammed",
    lastName: "Al Qasimi",
    gender: "male",
    title: "Senior Retail Operations Manager",
    companyIndex: 4, // Meraas Retail Division
    email: "m.qasimi@meraas.ae",
    phone: "+971 50 782 9140",
    background:
      "Manages tenant fit-out permits, DDA authority clearances, and retail handover schedules at City Walk.",
  },
  {
    firstName: "Zaid",
    lastName: "Al Mansoori",
    gender: "male",
    title: "Executive Director of Commercial Assets",
    companyIndex: 5, // Omniyat Executive Suites
    email: "zaid.mansoori@omniyat.ae",
    phone: "+971 52 940 1823",
    background:
      "Oversees turnkey commercial suites, acoustic partition criteria, and high-spec executive office delivery in Business Bay.",
  },
  {
    firstName: "Fatima",
    lastName: "Al Zaabi",
    gender: "female",
    title: "Senior Contracts & Procurement Manager",
    companyIndex: 6, // Azizi Developments LLC
    email: "fatima.zaabi@azizidevelopments.com",
    phone: "+971 58 920 4481",
    background:
      "Leads subcontractor vetting, tender evaluation committees, and payment certificate disbursements for Meydan projects.",
  },
  {
    firstName: "Vikram",
    lastName: "Malhotra",
    gender: "male",
    title: "Logistics Infrastructure Director",
    companyIndex: 7, // Dubai South Logistics Park
    email: "vikram.m@dubaisouth.ae",
    phone: "+971 55 384 1092",
    background:
      "Coordinates industrial warehouse zoning, DEWA substation energisation, and civil defense compliance at Dubai South.",
  },
  {
    firstName: "Omar",
    lastName: "Al Hashimi",
    gender: "male",
    title: "Master Planning & Permits Director",
    companyIndex: 8, // Nakheel Master Developments
    email: "omar.hashimi@nakheel.com",
    phone: "+971 50 192 8374",
    background:
      "Authorizes coastal setback approvals, villa architectural extensions, and master developer NOCs across Palm Jumeirah.",
  },
  {
    firstName: "Layla",
    lastName: "Al Suwaidi",
    gender: "female",
    title: "Senior Interior Concept Specialist",
    companyIndex: 9, // Select Group Waterfront
    email: "layla.suwaidi@select-group.ae",
    phone: "+971 52 645 2819",
    background:
      "Curates luxury waterfront penthouse fit-out packages, bespoke joinery, and lighting control scenes in Dubai Marina.",
  },
  {
    firstName: "Carlos",
    lastName: "Mendez",
    gender: "male",
    title: "Head of Commercial Facilities",
    companyIndex: 10, // Aldar Commercial Projects
    email: "carlos.mendez@aldar.com",
    phone: "+971 50 837 4610",
    background:
      "Supervises commercial office fit-outs, Abu Dhabi municipality permits, and HVAC preventive maintenance on Yas Island.",
  },
  {
    firstName: "Sophie",
    lastName: "Laurent",
    gender: "female",
    title: "Director of Resort Engineering & MEP",
    companyIndex: 11, // Seven Tides Hospitality
    email: "sophie.laurent@seventides.com",
    phone: "+971 55 491 8230",
    background:
      "Directs resort mechanical utilities, chiller plant overhauls, and annual MEP maintenance contracts on Palm Jumeirah.",
  },
  {
    firstName: "Abdullah",
    lastName: "Al Marri",
    gender: "male",
    title: "Senior Residential Community Manager",
    companyIndex: 12, // Majid Al Futtaim Communities
    email: "abdullah.marri@maf.ae",
    phone: "+971 50 382 9104",
    background:
      "Manages developer guidelines, show villa handovers, and community landscaping approvals at Tilal Al Ghaf.",
  },
  {
    firstName: "Maya",
    lastName: "Al Khoury",
    gender: "female",
    title: "Managing Director of Corporate Real Estate",
    companyIndex: 13, // DIFC Gate Investments LLC
    email: "maya.khoury@difcgate.ae",
    phone: "+971 52 104 9582",
    background:
      "Oversees Grade-A commercial office acquisitions, acoustic test sign-offs, and luxury fit-out completions at DIFC Gate.",
  },
  {
    firstName: "Humaid",
    lastName: "Al Shamsi",
    gender: "male",
    title: "Senior Asset Refurbishment Manager",
    companyIndex: 14, // Wasl Asset Management
    email: "humaid.shamsi@wasl.ae",
    phone: "+971 58 719 3045",
    background:
      "Directs residential tower refurbishment, MEP pipework upgrades, and handover snag list closures at Wasl Al Kifaf.",
  },
  {
    firstName: "Nadia",
    lastName: "Al Qubaisi",
    gender: "female",
    title: "Senior Fit-out Quantity Surveyor",
    companyIndex: 0, // Al Futtaim Properties LLC
    email: "nadia.qubaisi@futtaim.ae",
    phone: "+971 50 492 8173",
    background:
      "Handles commercial variation orders, cost reconciliation, and BOQ audits for retail & commercial tenant spaces.",
  },
  {
    firstName: "Alexander",
    lastName: "Vance",
    gender: "male",
    title: "Technical MEP Consultant",
    companyIndex: 1, // Emaar Hospitality Group
    email: "alexander.vance@emaar.ae",
    phone: "+971 55 829 1043",
    background:
      "Consults on hotel kitchen ventilation, DEWA load distribution boards, and fire safety systems across Emaar properties.",
  },
  {
    firstName: "Mariam",
    lastName: "Al Blooshi",
    gender: "female",
    title: "Senior Project Coordinator",
    companyIndex: 2, // DAMAC Luxury Developments
    email: "mariam.blooshi@damacgroup.com",
    phone: "+971 50 638 1920",
    background:
      "Coordinates contractor submittals, consultant requests for information (RFIs), and landlord fit-out inspections.",
  },
  {
    firstName: "Arjun",
    lastName: "Kapoor",
    gender: "male",
    title: "Structural & Joinery Specialist",
    companyIndex: 3, // Sobha Realty Commercial
    email: "arjun.kapoor@sobha.ae",
    phone: "+971 52 710 4928",
    background:
      "Inspects luxury veneer joinery, custom millwork, and architectural metalwork across high-end developments.",
  },
  {
    firstName: "Farhan",
    lastName: "Siddiqui",
    gender: "male",
    title: "Senior Permitting & Approvals Officer",
    companyIndex: 4, // Meraas Retail Division
    email: "farhan.s@meraas.ae",
    phone: "+971 58 392 0184",
    background:
      "Facilitates Dubai Municipality food hygiene approvals, grease trap permits, and signage permits for retail brands.",
  },
  {
    firstName: "Jessica",
    lastName: "Taylor",
    gender: "female",
    title: "Senior Commercial Leasing Director",
    companyIndex: 5, // Omniyat Executive Suites
    email: "jessica.taylor@omniyat.ae",
    phone: "+971 55 928 3741",
    background:
      "Coordinates client space planning, turn-key handover milestones, and lease agreement fit-out clauses.",
  },
  {
    firstName: "Sultan",
    lastName: "Al Mazrouei",
    gender: "male",
    title: "Civil Defense & Safety Manager",
    companyIndex: 6, // Azizi Developments LLC
    email: "sultan.mazrouei@azizidevelopments.com",
    phone: "+971 50 819 2038",
    background:
      "Liaises with Dubai Civil Defense (DCD) for fire pump testing, smoke management system tests, and building NOCs.",
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    gender: "female",
    title: "Facilities Operations Head",
    companyIndex: 7, // Dubai South Logistics Park
    email: "priya.sharma@dubaisouth.ae",
    phone: "+971 52 401 9283",
    background:
      "Supervises MEP maintenance vendors, power monitoring meters, and chilled water distributions at logistics park.",
  },
  {
    firstName: "Khalid",
    lastName: "Bin Huraiz",
    gender: "male",
    title: "Coastal Authority Liaison Officer",
    companyIndex: 8, // Nakheel Master Developments
    email: "khalid.huraiz@nakheel.com",
    phone: "+971 50 948 2710",
    background:
      "Handles marine environment clearance, coastal wall construction permits, and luxury beachfront villa verifications.",
  },
  {
    firstName: "David",
    lastName: "Chen",
    gender: "male",
    title: "Smart Automation & IT Systems Lead",
    companyIndex: 9, // Select Group Waterfront
    email: "david.chen@select-group.ae",
    phone: "+971 55 182 9304",
    background:
      "Integrates smart home automation, security access, and conference room AV for luxury residential and commercial towers.",
  },
  {
    firstName: "Reem",
    lastName: "Al Ghaith",
    gender: "female",
    title: "Procurement & Contracts Specialist",
    companyIndex: 10, // Aldar Commercial Projects
    email: "reem.ghaith@aldar.com",
    phone: "+971 58 630 1928",
    background:
      "Manages contractor qualification, advance payment guarantees, and milestone disbursement documentation in Abu Dhabi.",
  },
  {
    firstName: "Marcus",
    lastName: "Sterling",
    gender: "male",
    title: "Executive Hospitality Consultant",
    companyIndex: 11, // Seven Tides Hospitality
    email: "marcus.sterling@seventides.com",
    phone: "+971 50 719 3840",
    background:
      "Advises on 5-star hotel renovation schedules, guest impact minimisation plans, and phased room handovers.",
  },
  {
    firstName: "Amira",
    lastName: "Al Ketbi",
    gender: "female",
    title: "Senior Architect & Landscape Designer",
    companyIndex: 12, // Majid Al Futtaim Communities
    email: "amira.ketbi@maf.ae",
    phone: "+971 52 830 1948",
    background:
      "Reviews villa facade alterations, pool permit submissions, and pergola structures for community aesthetic compliance.",
  },
  {
    firstName: "Noor",
    lastName: "Al Mutawa",
    gender: "female",
    title: "Legal & Contracts Counsel",
    companyIndex: 13, // DIFC Gate Investments LLC
    email: "noor.mutawa@difcgate.ae",
    phone: "+971 50 371 9284",
    background:
      "Advises on FIDIC fit-out contracts, defect liability obligations, and DIFC common-law property regulations.",
  },
  {
    firstName: "Hessa",
    lastName: "Al Nuaimi",
    gender: "female",
    title: "Residential Renovation Supervisor",
    companyIndex: 14, // Wasl Asset Management
    email: "hessa.nuaimi@wasl.ae",
    phone: "+971 55 640 1829",
    background:
      "Conducts pre-handover snag list walkthroughs and coordinates tenant move-in NOCs across Wasl residential units.",
  },
];

export const generateContacts = (
  db: Db,
  size = UAE_CONTACT_SEEDS.length,
): Contact[] => {
  return Array.from(Array(size).keys()).map((id) => {
    const seed = UAE_CONTACT_SEEDS[id % UAE_CONTACT_SEEDS.length];
    const company = db.companies[seed.companyIndex % db.companies.length];
    company.nb_contacts = (company.nb_contacts ?? 0) + 1;

    const email_jsonb = [
      {
        email: seed.email,
        type: "Work" as const,
      },
    ];

    const phone_jsonb = [
      {
        number: seed.phone,
        type: "Work" as const,
      },
    ];

    const avatar = {
      src: `https://images.unsplash.com/photo-${
        seed.gender === "female"
          ? "1573496359142-b8d87734a5a2"
          : "1507003211169-0a1dd7228f2d"
      }?w=128&h=128&fit=crop&crop=faces`,
    };

    const first_seen = randomDate(new Date(company.created_at)).toISOString();
    const last_seen = first_seen;

    return {
      id,
      first_name: seed.firstName,
      last_name: seed.lastName,
      gender: seed.gender,
      title: seed.title,
      company_id: company.id,
      company_name: company.name,
      email_jsonb,
      phone_jsonb,
      background: seed.background,
      acquisition: id % 2 === 0 ? "inbound" : "outbound",
      avatar,
      first_seen,
      last_seen,
      has_newsletter: weightedBoolean(30),
      status: defaultNoteStatuses[id % defaultNoteStatuses.length].value,
      tags:
        db.tags && db.tags.length > 0
          ? [(db.tags[id % db.tags.length] as Tag).id]
          : [],
      sales_id: company.sales_id!,
      nb_tasks: 0,
      linkedin_url: `https://www.linkedin.com/in/${seed.firstName.toLowerCase()}-${seed.lastName.toLowerCase().replace(/\s+/g, "")}`,
    };
  });
};
