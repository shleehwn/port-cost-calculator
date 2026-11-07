import { describe, it, expect } from "vitest";
import { calculateAnchorageDues } from "./anchorageCalculator";

describe("Anchorage Dues Calculator", () => {
  const base = {
    port: "INCHEON",
    vesselType: "OCEAN",
    grt: 30000,
  };

  it("12시간 정박 시 기본요금 561,000원", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 12,
    });

    expect(result.anchorageFee).toBe(561000);
  });

  it("25시간 정박 시 621,762원", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 25,
    });

    expect(result.anchorageFee).toBe(621762);
  });

  it("48시간 정박 시 729,264원", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 48,
    });

    expect(result.anchorageFee).toBe(729264);
  });

  it("벙커링 + EDI 허가 + 24시간 이내면 면제", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 24,
      isBunkering: true,
      hasEdiApproval: true,
    });

    expect(result.isExempt).toBe(true);
    expect(result.anchorageFee).toBe(0);
  });

  it("벙커링 + EDI 허가라도 24시간 초과 시 소급 부과", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 25,
      isBunkering: true,
      hasEdiApproval: true,
    });

    expect(result.isExempt).toBe(false);
    expect(result.anchorageFee).toBe(621762);
    expect(result.retroactivePortDuesRequired).toBe(true);
  });

  it("EDI 허가가 없으면 24시간 이내라도 면제되지 않음", () => {
    const result = calculateAnchorageDues({
      ...base,
      anchorageHours: 20,
      isBunkering: true,
      hasEdiApproval: false,
    });

    expect(result.isExempt).toBe(false);
    expect(result.anchorageFee).toBe(598392);
  });
});
