import { describe, test, expect } from "vitest";
import {
  calculateSeaFuelConsumption,
  calculateVoyageFuelCost,
  calculateFuelCostByOperation,
} from "./fuelConsumptionCalculator";

import { getBulkCarrierFuelProfile } from "../data/vesselFuelProfiles";

describe("벌크선 항해 연료 소모량 계산", () => {
  test("58,000 DWT Supramax 기준 계산", () => {
    const result = calculateSeaFuelConsumption({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      seaMargin: 5,
    });

    expect(result.vesselClass).toBe("Supramax / Ultramax");
    expect(result.seaDays).toBeCloseTo(8.75, 5);
    expect(result.mainEngineDaily).toBeCloseTo(22.65, 1);
    expect(result.mainEngineTotal).toBeCloseTo(198.2, 0);
  });

  test("기준 범위에 없는 DWT는 오류 발생", () => {
    expect(() =>
      calculateSeaFuelConsumption({
        dwt: 45000,
        distanceNm: 2500,
        speedKnots: 12.5,
      }),
    ).toThrow("해당 DWT의 벌크선 기준 데이터가 없습니다.");
  });

  test("선속이 0이면 오류 발생", () => {
    expect(() =>
      calculateSeaFuelConsumption({
        dwt: 58000,
        distanceNm: 2500,
        speedKnots: 0,
      }),
    ).toThrow("항해 거리, 선속, Sea Margin 값을 확인해주세요.");
  });

  test("선속이 증가하면 일일 연료 소모량도 증가", () => {
    const slow = calculateSeaFuelConsumption({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 11,
    });

    const fast = calculateSeaFuelConsumption({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 14,
    });

    expect(fast.mainEngineDaily).toBeGreaterThan(slow.mainEngineDaily);
  });
});

describe("항차 연료비 계산", () => {
  test("항해 및 정박 연료비 합산", () => {
    const result = calculateVoyageFuelCost({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      seaMargin: 5,

      auxiliaryDaily: 1.5,
      idleDays: 1,
      workingDays: 4,
      idleDaily: 2.5,
      workingDaily: 5,

      vlsfoPrice: 600,
      mgoPrice: 800,
    });

    expect(result.seaDays).toBeCloseTo(8.75, 5);

    expect(result.auxiliaryFuel).toBeCloseTo(13.125, 5);
    expect(result.idleFuel).toBeCloseTo(2.5, 5);
    expect(result.workingFuel).toBeCloseTo(20, 5);

    expect(result.mgoTotal).toBeCloseTo(35.625, 5);

    expect(result.totalFuel).toBeCloseTo(
      result.vlsfoTotal + result.mgoTotal,
      5,
    );

    expect(result.totalCost).toBeCloseTo(result.vlsfoCost + result.mgoCost, 5);
  });

  test("정박 일수가 0이면 정박 연료 소모량도 0", () => {
    const result = calculateVoyageFuelCost({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      idleDays: 0,
      workingDays: 0,
    });

    expect(result.idleFuel).toBe(0);
    expect(result.workingFuel).toBe(0);
  });
});

describe("운항 상태별·유종별 연료비 계산", () => {
  test("VLSFO와 MGO를 각각 합산한다", () => {
    const result = calculateFuelCostByOperation({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      seaMargin: 5,

      seaVlsfoDaily: 20,
      seaMgoDaily: 1.5,

      idleDays: 1,
      idleVlsfoDaily: 2.5,
      idleMgoDaily: 1.5,

      workingDays: 4,
      workingVlsfoDaily: 2.5,
      workingMgoDaily: 1.5,

      vlsfoPrice: 600,
      mgoPrice: 800,
    });

    expect(result.seaDays).toBeCloseTo(8.75, 5);

    // VLSFO = 항해 175 + 정박 12.5
    expect(result.vlsfoTotal).toBeCloseTo(187.5, 5);

    // MGO = (항해 8.75 + 정박 5) × 1.5
    expect(result.mgoTotal).toBeCloseTo(20.625, 5);

    // VLSFO $112,500 + MGO $16,500
    expect(result.totalCost).toBeCloseTo(129000, 5);
  });

  test("항해 VLSFO 미입력 시 자동 추천값 사용", () => {
    const result = calculateFuelCostByOperation({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
    });

    expect(result.appliedSeaVlsfoDaily).toBeCloseTo(result.mainEngineDaily, 5);
  });

  test("수동 입력값이 자동 추천값보다 우선한다", () => {
    const result = calculateFuelCostByOperation({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      seaVlsfoDaily: 20,
    });

    expect(result.appliedSeaVlsfoDaily).toBe(20);
    expect(result.seaVlsfoTotal).toBeCloseTo(result.seaDays * 20, 5);
  });

  test("음수 연료 소비량 입력 시 오류 발생", () => {
    expect(() =>
      calculateFuelCostByOperation({
        dwt: 58000,
        distanceNm: 2500,
        speedKnots: 12.5,
        idleMgoDaily: -1,
      }),
    ).toThrow("idleMgoDaily 입력값을 확인해주세요.");
  });
});

describe("선형별 연료 소비량 프로파일", () => {
  test("58,000 DWT는 Supramax 프로파일을 반환한다", () => {
    const profile = getBulkCarrierFuelProfile(58000);

    expect(profile.id).toBe("SUPRAMAX");
    expect(profile.fuelRates.seaMgoDaily).toBe(1.0);
    expect(profile.fuelRates.idleMgoDaily).toBe(1.2);
    expect(profile.fuelRates.workingMgoDaily).toBe(2.5);
  });

  test("180,000 DWT는 Capesize 프로파일을 반환한다", () => {
    const profile = getBulkCarrierFuelProfile(180000);

    expect(profile.id).toBe("CAPESIZE");
    expect(profile.fuelRates.seaMgoDaily).toBe(1.5);
  });

  test("지원하지 않는 DWT는 null을 반환한다", () => {
    expect(getBulkCarrierFuelProfile(45000)).toBeNull();
  });
});

describe("선형별 연료 소비량 자동 적용", () => {
  test("Supramax 연료 소비량 자동 적용", () => {
    const result = calculateFuelCostByOperation({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      idleDays: 1,
      workingDays: 4,
    });

    expect(result.appliedFuelRates.seaMgoDaily).toBe(1.0);
    expect(result.appliedFuelRates.idleMgoDaily).toBe(1.2);
    expect(result.appliedFuelRates.workingMgoDaily).toBe(2.5);

    expect(result.idleMgoTotal).toBeCloseTo(1.2, 5);
    expect(result.workingMgoTotal).toBeCloseTo(10, 5);
  });

  test("선형에 따라 자동 추천값이 달라진다", () => {
    const handy = calculateFuelCostByOperation({
      dwt: 35000,
      distanceNm: 2500,
      speedKnots: 12.5,
    });

    const cape = calculateFuelCostByOperation({
      dwt: 180000,
      distanceNm: 2500,
      speedKnots: 12.5,
    });

    expect(handy.appliedFuelRates.seaMgoDaily).toBe(0.8);
    expect(cape.appliedFuelRates.seaMgoDaily).toBe(1.5);
  });

  test("수동으로 0을 입력하면 자동 추천값을 덮어쓴다", () => {
    const result = calculateFuelCostByOperation({
      dwt: 58000,
      distanceNm: 2500,
      speedKnots: 12.5,
      seaMgoDaily: 0,
      idleMgoDaily: 0,
    });

    expect(result.appliedFuelRates.seaMgoDaily).toBe(0);
    expect(result.appliedFuelRates.idleMgoDaily).toBe(0);
    expect(result.seaMgoTotal).toBe(0);
  });
});
