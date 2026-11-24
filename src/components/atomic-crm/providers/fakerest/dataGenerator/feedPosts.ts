import type { Db } from "./types";
import type { FeedPost } from "../../../types";

export const generateFeedPosts = (_db: Db): FeedPost[] => {
  return [
    {
      id: 1,
      author_name: "Navas",
      author_role: "Managing Director",
      tenant_id: 1,
      type: "announcement",
      title: "Q4 2026 Commercial Expansion & UAE Group Record",
      content:
        "Team, proud to announce that across Goldland Contracting, Abbadi Tech, and Casavera Interiors, our active pipeline has crossed AED 15,000,000! Great collaboration between our engineering and interior fitout teams on the Al Barari and Palm Jumeirah luxury projects.",
      likes_count: 14,
      comments_count: 3,
      created_at: "2026-11-20T08:30:00Z",
      comments: [
        {
          id: "c1",
          author: "Asma (Design Lead)",
          text: "Huge milestone! The Casavera studio is pushing hard on the Penthouse staging designs.",
          created_at: "2026-11-20T09:15:00Z",
        },
        {
          id: "c2",
          author: "Sadiq (Senior MEP)",
          text: "DEWA approvals are on schedule too. Well done everyone!",
          created_at: "2026-11-20T10:05:00Z",
        },
      ],
    },
    {
      id: 2,
      author_name: "Abrar",
      author_role: "Operations Director",
      tenant_id: 1,
      type: "appreciation",
      title: "GroupCRM Appreciation Badge: Fast Approvals Champion",
      content:
        "Huge shoutout to Faseela for securing the Dubai Civil Defense (DCD) Fire Life Safety NOC for Al Falasi Penthouse in record time — 4 days ahead of authority SLA! Outstanding coordination with the authorities.",
      badge: "fast_approvals",
      recipient_name: "Faseela (Permits Specialist)",
      likes_count: 18,
      comments_count: 2,
      created_at: "2026-11-21T11:00:00Z",
      comments: [
        {
          id: "c3",
          author: "Faseela",
          text: "Thank you Abrar! Having the single line engineering diagrams ready made all the difference.",
          created_at: "2026-11-21T11:45:00Z",
        },
      ],
    },
    {
      id: 3,
      author_name: "Sadiq",
      author_role: "Senior MEP Engineer",
      tenant_id: 2,
      type: "milestone",
      title:
        "Milestone Achieved: DEWA Substation Pad & Transformer Energization",
      content:
        "Milestone completed on the Emirates Hills Project (AT-PRJ-2026-002)! DEWA site inspection passed with zero non-conformances. Ready to pull the 4x300 sq mm XLPE heavy power feeders on Sunday.",
      likes_count: 12,
      comments_count: 1,
      created_at: "2026-11-21T16:20:00Z",
      comments: [
        {
          id: "c4",
          author: "Arshad (Site Inspection)",
          text: "Earth pit testing confirmed <0.8 ohms. Clean handover!",
          created_at: "2026-11-21T17:10:00Z",
        },
      ],
    },
    {
      id: 4,
      author_name: "Asma",
      author_role: "Interior Design Director",
      tenant_id: 3,
      type: "deal",
      title: "Contract Signed: AED 450,000 Downtown Luxury Penthouse",
      content:
        "Casavera Interiors has officially secured the contract for Sarah Kensington's luxury penthouse! Complete bespoke Italian joinery, ambient lighting control, and marble floor accents.",
      badge: "deal_closer",
      recipient_name: "Casavera Studio Team",
      likes_count: 22,
      comments_count: 4,
      created_at: "2026-11-22T08:15:00Z",
      comments: [
        {
          id: "c5",
          author: "Navas (MD)",
          text: "Mabrook! Excellent work closing this ahead of the Dubai design season.",
          created_at: "2026-11-22T08:45:00Z",
        },
      ],
    },
  ];
};
