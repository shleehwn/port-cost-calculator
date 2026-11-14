/**
 * Bulk Carrier Fuel Consumption Profiles
 *
 * 초기 개발용 추정 데이터
 * 공식 보증 연비 또는 Baltic Exchange 공식 수치가 아님.
 *
 * Consumption: MT/day
 * Speed: knots
 */

export const BULK_CARRIER_FUEL_PROFILES = [
  {
    id: "HANDYSIZE",
    name: "Handysize",
    minDwt: 15000,
    maxDwt: 49999,
    referenceSpeed: 12.75,
    mainEngineDaily: 20.5,
    mainEngineRange: [18, 23],

    fuelRates: {
      seaMgoDaily: 0.8,
      idleVlsfoDaily: 0,
      idleMgoDaily: 1.0,
      workingVlsfoDaily: 0,
      workingMgoDaily: 2.0,
    },
  },
  {
    id: "SUPRAMAX",
    name: "Supramax / Ultramax",
    minDwt: 50000,
    maxDwt: 64999,
    referenceSpeed: 13.25,
    mainEngineDaily: 27.0,
    mainEngineRange: [24, 30],

    fuelRates: {
      seaMgoDaily: 1.0,
      idleVlsfoDaily: 0,
      idleMgoDaily: 1.2,
      workingVlsfoDaily: 0,
      workingMgoDaily: 2.5,
    },
  },
  {
    id: "PANAMAX",
    name: "Panamax / Kamsarmax",
    minDwt: 65000,
    maxDwt: 99999,
    referenceSpeed: 13.75,
    mainEngineDaily: 31.5,
    mainEngineRange: [28, 35],

    fuelRates: {
      seaMgoDaily: 1.2,
      idleVlsfoDaily: 0,
      idleMgoDaily: 1.5,
      workingVlsfoDaily: 0,
      workingMgoDaily: 2.0,
    },
  },
  {
    id: "CAPESIZE",
    name: "Capesize / Newcastlemax",
    minDwt: 100000,
    maxDwt: 200000,
    referenceSpeed: 13.75,
    mainEngineDaily: 44.0,
    mainEngineRange: [38, 50],

    fuelRates: {
      seaMgoDaily: 1.5,
      idleVlsfoDaily: 0,
      idleMgoDaily: 2.0,
      workingVlsfoDaily: 0,
      workingMgoDaily: 2.5,
    },
  },
];

export function getBulkCarrierFuelProfile(dwt) {
  const value = Number(dwt);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return (
    BULK_CARRIER_FUEL_PROFILES.find(
      (profile) => value >= profile.minDwt && value <= profile.maxDwt,
    ) ?? null
  );
}
