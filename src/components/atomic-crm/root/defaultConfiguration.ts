import type { ConfigurationContextValue } from "./ConfigurationContext";
// Import the logos as module assets so Vite resolves their URL relative to the
// JS chunk (import.meta.url), not the current route. A plain "./logos/..." path
// breaks on nested routes like /oauth/consent and under a deployment sub-path.
import darkModeLogo from "./logos/logo_groupcrm_dark.svg";
import lightModeLogo from "./logos/logo_groupcrm_light.svg";

export const defaultDarkModeLogo = darkModeLogo;
export const defaultLightModeLogo = lightModeLogo;

export const defaultCurrency = "AED";

export const defaultTitle = "Group CRM";

export const defaultCompanySectors = [
  { value: "authority-approvals", label: "Authority Approvals & Licensing" },
  { value: "architecture-design", label: "Architecture & Structural Design" },
  { value: "technical-mep", label: "MEP & Technical Services" },
  { value: "interior-fitout", label: "Commercial & Luxury Fit-out" },
  { value: "real-estate", label: "Real Estate & Developer" },
  { value: "hospitality", label: "Hospitality & Retail" },
  { value: "residential", label: "Residential & Private Villas" },
  { value: "information-technology", label: "Information Technology" },
  { value: "communication-services", label: "Communication Services" },
  { value: "consumer-discretionary", label: "Consumer Discretionary" },
  { value: "consumer-staples", label: "Consumer Staples" },
  { value: "energy", label: "Energy" },
  { value: "financials", label: "Financials" },
  { value: "health-care", label: "Health Care" },
  { value: "industrials", label: "Industrials" },
  { value: "materials", label: "Materials" },
  { value: "utilities", label: "Utilities" },
];

export const defaultDealStages = [
  { value: "NEW", label: "New" },
  { value: "INITIATED", label: "Initiated" },
  { value: "UNDER_FOLLOW_UP", label: "Under Follow-up" },
  { value: "WARM", label: "Warm" },
  { value: "HOT", label: "Hot" },
  { value: "COLD", label: "Cold" },
  { value: "JUNK", label: "Junk" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export const defaultDealPipelineStatuses = ["WON"];

export const defaultDealCategories = [
  { value: "authority-approvals", label: "Authority Approvals (DDA/DM/DCD)" },
  { value: "architecture-design", label: "Architectural & Structural Drawings" },
  { value: "electrical-mep", label: "Electrical & MEP Load Upgrades" },
  { value: "plumbing-drainage", label: "Plumbing & Drainage Works" },
  { value: "hvac-maintenance", label: "HVAC & Chiller Maintenance" },
  { value: "luxury-interiors", label: "Luxury Interior Concept & 3D BOQ" },
  { value: "commercial-fitout", label: "Commercial & Retail Fit-out" },
  { value: "villa-renovation", label: "Residential Renovation & Joinery" },
  { value: "other", label: "Other" },
  { value: "copywriting", label: "Copywriting" },
  { value: "print-project", label: "Print project" },
  { value: "ui-design", label: "UI Design" },
  { value: "website-design", label: "Website design" },
];

export const defaultNoteStatuses = [
  { value: "cold", label: "Cold", color: "#7dbde8" },
  { value: "warm", label: "Warm", color: "#e8cb7d" },
  { value: "hot", label: "Hot", color: "#e88b7d" },
  { value: "in-contract", label: "In Contract", color: "#a4e87d" },
];

export const defaultTaskTypes = [
  { value: "none", label: "None" },
  { value: "email", label: "Email" },
  { value: "demo", label: "Demo" },
  { value: "lunch", label: "Lunch" },
  { value: "meeting", label: "Meeting" },
  { value: "follow-up", label: "Follow-up" },
  { value: "thank-you", label: "Thank you" },
  { value: "ship", label: "Ship" },
  { value: "call", label: "Call" },
];

export const defaultConfiguration: ConfigurationContextValue = {
  companySectors: defaultCompanySectors,
  currency: defaultCurrency,
  dealCategories: defaultDealCategories,
  dealPipelineStatuses: defaultDealPipelineStatuses,
  dealStages: defaultDealStages,
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
};
