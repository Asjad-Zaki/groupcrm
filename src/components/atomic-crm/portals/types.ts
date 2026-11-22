export type AuthorityCategory =
  | "all"
  | "municipalities"
  | "civil_defence"
  | "utilities"
  | "developers";

export interface AuthorityPortal {
  id: string;
  name: string;
  acronym: string;
  category: "municipalities" | "civil_defence" | "utilities" | "developers";
  url: string;
  description: string;
  operating_companies: Array<"goldland" | "abbadi" | "casavera">;
  submission_guidelines: string[];
  required_documents: string[];
  contact_hotline?: string;
  working_hours?: string;
  is_favorite?: boolean;
}
