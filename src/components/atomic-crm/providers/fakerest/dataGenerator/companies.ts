import {
  datatype,
  random,
} from "faker/locale/en_US";

import { randomDate } from "./utils";
import { defaultCompanySectors } from "../../../root/defaultConfiguration";
import type { Company, RAFile } from "../../../types";
import type { Db } from "./types";

const sizes = [1, 10, 50, 250, 500];

const UAE_ORGANIZATIONS = [
  { name: "Al Futtaim Properties LLC", city: "Dubai", area: "Festival City", sector: "real-estate" },
  { name: "Emaar Hospitality Group", city: "Dubai", area: "Downtown Dubai", sector: "hospitality" },
  { name: "DAMAC Luxury Developments", city: "Dubai", area: "Business Bay", sector: "real-estate" },
  { name: "Sobha Realty Commercial", city: "Dubai", area: "Sobha Hartland", sector: "real-estate" },
  { name: "Meraas Retail Division", city: "Dubai", area: "City Walk", sector: "hospitality" },
  { name: "Omniyat Executive Suites", city: "Dubai", area: "Business Bay", sector: "interior-fitout" },
  { name: "Azizi Developments LLC", city: "Dubai", area: "Meydan", sector: "real-estate" },
  { name: "Dubai South Logistics Park", city: "Dubai", area: "Dubai South", sector: "technical-mep" },
  { name: "Nakheel Master Developments", city: "Dubai", area: "Palm Jumeirah", sector: "authority-approvals" },
  { name: "Select Group Waterfront", city: "Dubai", area: "Dubai Marina", sector: "residential" },
  { name: "Aldar Commercial Projects", city: "Abu Dhabi", area: "Yas Island", sector: "real-estate" },
  { name: "Seven Tides Hospitality", city: "Dubai", area: "Palm Jumeirah", sector: "hospitality" },
  { name: "Majid Al Futtaim Communities", city: "Dubai", area: "Tilal Al Ghaf", sector: "residential" },
  { name: "DIFC Gate Investments LLC", city: "Dubai", area: "DIFC", sector: "commercial-fitout" },
  { name: "Wasl Asset Management", city: "Dubai", area: "Al Kifaf", sector: "real-estate" },
];

export const generateCompanies = (db: Db, size = UAE_ORGANIZATIONS.length): Company[] => {
  return Array.from(Array(size).keys()).map((id) => {
    const org = UAE_ORGANIZATIONS[id % UAE_ORGANIZATIONS.length];
    return {
      id,
      name: org.name,
      logo: {
        title: org.name,
        src: `https://marmelab.com/react-admin-crm/logos/${(id % 20) + 1}.png`,
      } as RAFile,
      sector: org.sector || random.arrayElement(defaultCompanySectors).value,
      size: random.arrayElement(sizes) as 1 | 10 | 50 | 250 | 500,
      linkedin_url: `https://www.linkedin.com/company/${org.name.toLowerCase().replace(/\W+/g, "-")}`,
      website: `https://www.${org.name.toLowerCase().replace(/\W+/g, "")}.ae`,
      phone_number: `+971 4 ${datatype.number({ min: 200, max: 999 })} ${datatype.number({ min: 1000, max: 9999 })}`,
      address: `Building ${(id % 12) + 1}, ${org.area}`,
      zipcode: "00000",
      city: org.city,
      state_abbr: org.city === "Abu Dhabi" ? "AD" : "DXB",
      nb_contacts: 0,
      nb_deals: 0,
      sales_id: db.sales[id % db.sales.length].id,
      created_at: randomDate(new Date(2026, 1, 1)).toISOString(),
      description: `UAE client organization operating in ${org.area}, ${org.city}.`,
      revenue: random.arrayElement(["AED 5M", "AED 15M", "AED 40M", "AED 120M"]),
      tax_identifier: `TRN 100${datatype.number({ min: 100000000, max: 999999999 })}`,
      country: "United Arab Emirates",
      context_links: [],
    };
  });
};
