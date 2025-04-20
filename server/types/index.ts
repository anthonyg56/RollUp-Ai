import { auth } from "@server/auth";
import api from "@server/api";

export type ApiType = typeof api;

export interface HonoVariables {
  user: HonoUser | null;
  session: HonoSession | null;
}

export type HonoUser = typeof auth.$Infer.Session.user;
export type HonoSession = typeof auth.$Infer.Session.session;