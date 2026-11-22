import type { Db } from "./types";
import type { Meeting } from "../../../types";

export const generateMeetings = (_db: Db): Meeting[] => {
  const now = new Date();
  const pastTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const liveStartTime = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const liveEndTime = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
  const upcomingToday = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const upcomingTodayEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const upcomingTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const upcomingTomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 1,
      title: "Authority Review & CED Submission Alignment",
      tenant_id: 1, // Goldland
      kind: "instant",
      agenda: "Review DDA architectural feedback for Business Bay commercial tower floors 14-16 before 3 PM resubmission.",
      host_id: 0, // Navas
      project_id: 2,
      scheduled_start: liveStartTime,
      scheduled_end: liveEndTime,
      timezone: "Asia/Dubai",
      status: "live",
      room_name: "GL-DDA-ALIGN",
      join_code: "GL-98214",
      guest_access: "waiting_room",
      max_guests: 15,
      join_before_host: false,
      created_by: "Navas (MD)",
      participants: [
        {
          id: "p-1",
          userId: 0,
          name: "Navas (MD)",
          role: "host",
          inviteStatus: "joined",
          isVideoOn: true,
          isMuted: false,
        },
        {
          id: "p-2",
          userId: 4,
          name: "Arshad (Site Eng.)",
          role: "attendee",
          inviteStatus: "joined",
          isVideoOn: true,
          isMuted: true,
        },
        {
          id: "p-3",
          userId: 99,
          name: "Tariq Mansoor (DDA Consultant)",
          role: "guest",
          guestEmail: "tariq@dda-consult.ae",
          inviteStatus: "admitted",
          isVideoOn: false,
          isMuted: false,
        },
      ],
      outcomes: [
        {
          id: "o-1",
          decision: "Approved modification of MEP riser drawings to match revised DDA riser shaft specs.",
          action_item: "Update CAD drawings sheet A-104 and upload to folder by 2:30 PM",
          assignee: "Navas",
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 2,
      title: "MEP Load Enhancement & DEWA Substation Review",
      tenant_id: 2, // Abbadi Tech
      kind: "scheduled",
      agenda: "Review 350kW DEWA substation upgrade schematics and cable routing for Emirates Hills villa compound.",
      host_id: 2, // Junaid
      project_id: 4,
      scheduled_start: upcomingToday,
      scheduled_end: upcomingTodayEnd,
      timezone: "Asia/Dubai",
      status: "scheduled",
      room_name: "AT-DEWA-LOAD",
      join_code: "AT-43180",
      guest_access: "waiting_room",
      max_guests: 10,
      join_before_host: false,
      created_by: "Junaid (Site Engineer)",
      participants: [
        {
          id: "p-4",
          userId: 2,
          name: "Junaid (Site Engineer)",
          role: "host",
          inviteStatus: "invited",
        },
        {
          id: "p-5",
          userId: 1,
          name: "Abrar (Operations)",
          role: "attendee",
          inviteStatus: "invited",
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 3,
      title: "Turnkey Penthouse 3D Concept & Material Sign-off",
      tenant_id: 3, // Casavera
      kind: "scheduled",
      agenda: "Presentation of Italian marble samples, bespoke walnut joinery 3D render, and lighting mockups to client.",
      host_id: 1, // Abrar
      project_id: 6,
      lead_id: 14,
      scheduled_start: upcomingTomorrow,
      scheduled_end: upcomingTomorrowEnd,
      timezone: "Asia/Dubai",
      status: "scheduled",
      room_name: "CV-PENTHOUSE-SIGNOFF",
      join_code: "CV-77291",
      guest_access: "open",
      max_guests: 8,
      join_before_host: false,
      created_by: "Abrar (Operations)",
      participants: [
        {
          id: "p-6",
          userId: 1,
          name: "Abrar (Operations)",
          role: "host",
          inviteStatus: "invited",
        },
        {
          id: "p-7",
          userId: 98,
          name: "Sarah Al Hashimi (Owner Representative)",
          role: "guest",
          guestEmail: "sarah@alhashimiholding.com",
          inviteStatus: "invited",
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 4,
      title: "Dubai Municipality Structural Modification Walkthrough",
      tenant_id: 1, // Goldland
      kind: "scheduled",
      agenda: "Walkthrough of Al Quoz warehouse mezzanine alteration inspection notes with civil defense officer.",
      host_id: 4, // Arshad
      project_id: 1,
      scheduled_start: pastTime,
      scheduled_end: pastTime,
      timezone: "Asia/Dubai",
      status: "ended",
      room_name: "GL-DM-WALKTHROUGH",
      join_code: "GL-12093",
      guest_access: "waiting_room",
      max_guests: 10,
      join_before_host: false,
      created_by: "Arshad (Site Inspection Eng.)",
      outcomes: [
        {
          id: "o-2",
          decision: "Civil defense clearance passed with no snags.",
          action_item: "Issue completion certificate to client.",
          assignee: "Arshad",
        },
      ],
      created_at: pastTime,
      updated_at: pastTime,
    },
  ];
};
