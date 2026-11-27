import { describe, expect, it } from "vitest";
import {
  canCommand,
  canRegister,
  canVisit,
} from "../src/features/access/policy";
describe("role boundaries", () => {
  it("doctors keep clinical work but cannot register or issue patient passes", () => {
    for (const route of [
      "/registration",
      "/reception",
      "/nurse",
      "/settings/hospital",
      "/staff",
    ])
      expect(canVisit("doctor", route)).toBe(false);
    for (const action of ["register", "intake", "token", "staff_access"])
      expect(canCommand("doctor", action)).toBe(false);
    expect(canVisit("doctor", "/doctor")).toBe(true);
    expect(canCommand("doctor", "department_referral")).toBe(true);
  });
  it("administrators have operational pages without clinical actions", () => {
    for (const route of [
      "/triage",
      "/doctor",
      "/nurse",
      "/encounters/123",
      "/smartflow",
      "/protocols",
    ])
      expect(canVisit("hospital_admin", route)).toBe(false);
    for (const action of [
      "assess",
      "note",
      "opd_route",
      "transition",
      "protocol_review",
    ])
      expect(canCommand("hospital_admin", action)).toBe(false);
    expect(canVisit("hospital_admin", "/resources")).toBe(true);
    expect(canCommand("hospital_admin", "staff_access")).toBe(true);
  });
  it("nurses can register and route but cannot manage roles or diagnoses", () => {
    expect(canRegister("nurse")).toBe(true);
    expect(canCommand("nurse", "opd_route")).toBe(true);
    expect(canCommand("nurse", "staff_access")).toBe(false);
    expect(canCommand("nurse", "department_referral")).toBe(false);
  });
  it("unknown roles fail closed and super admin retains explicitly scoped elevated tools", () => {
    expect(canVisit("patient", "/dashboard")).toBe(false);
    for (const action of ["register", "alert", "bed_assign", "note", "unknown"])
      expect(canCommand("patient", action)).toBe(false);
    expect(canVisit("super_admin", "/staff")).toBe(true);
  });
});
