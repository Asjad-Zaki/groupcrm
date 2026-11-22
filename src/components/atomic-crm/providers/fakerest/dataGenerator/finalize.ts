import type { Db } from "./types";

export const finalize = (db: Db) => {
  // set contact status according to the latest note
  db.contact_notes
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
    .forEach((note) => {
      const contact = db.contacts.find((c) => c.id === note.contact_id);
      if (contact) {
        contact.status = note.status;
      }
    });
};
