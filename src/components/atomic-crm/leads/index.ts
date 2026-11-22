import { LeadList } from "./LeadList";
import { LeadShow } from "./LeadShow";
import { LeadCreate } from "./LeadCreate";

export { LeadList, LeadShow, LeadCreate };
export type { Lead } from "@/components/atomic-crm/types";

export default {
  list: LeadList,
  show: LeadShow,
  create: LeadCreate,
};