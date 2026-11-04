import { PILOTAGE_RATES } from "../data/pilotageRates.js";

/**
 * 도선료 기본 계산
 *
 * 현재 구현 범위:
 * - 도선 구간별 기본료
 * - 1,000GT 초과 가산
 * - 흘수 3m 초과 가산
 *
 * 미구현:
 * - 최저 도선료
 * - 야간 / 공휴일 할증
 * - 접안 / 이안 가산
 * - 도선선료
 * - 기타 특수 조건
 */
export function calculatePilotage({ port, route, grt, draft }) {
  const gt = Number(grt);
  const draftMeters = Number(draft);

  // 1. 항만 및 도선 구간 조회
  const portRates = PILOTAGE_RATES[port];

  if (!portRates) {
    throw new Error("해당 항만의 도선료 요율이 없습니다.");
  }

  const routeRate = portRates.routes[route];

  if (!routeRate) {
    throw new Error("해당 도선 구간의 요율이 없습니다.");
  }

  // 2. 입력값 검증
  if (
    !Number.isFinite(gt) ||
    !Number.isFinite(draftMeters) ||
    gt <= 0 ||
    draftMeters < 0
  ) {
    throw new Error("GT 또는 흘수 입력값을 확인해 주세요.");
  }

  // 3. GT 초과 단위 (1,000GT 기준)
  const extraGtUnits = Math.max(0, Math.ceil((gt - 1000) / 1000));

  // 4. Draft 초과 단위 (3m 기준, 0.3m마다)
  const extraDraftUnits = Math.max(
    0,
    Math.ceil(Math.round((draftMeters - 3) * 1000) / 300),
  );

  // 5. 초과료 계산
  const baseRate = routeRate.baseRate;

  const gtSurcharge = baseRate * 0.1 * extraGtUnits;

  const draftSurcharge = baseRate * 0.1 * extraDraftUnits;

  const subtotal = baseRate + gtSurcharge + draftSurcharge;

  // 최저 도선료 (1회당 270,000원)
  const minimumFee = 270000;
  const pilotageFee = Math.max(subtotal, minimumFee);

  return {
    baseRate,
    extraGtUnits,
    extraDraftUnits,
    gtSurcharge,
    draftSurcharge,
    subtotal: Math.trunc(subtotal),
    pilotageFee: Math.trunc(pilotageFee),
  };
}
// 입항 / 출항 도선료 기본 산식 계산
export function calculateRoundTripPilotage(vessel) {
  const { port, pilotageRoute, grt, arrivalDraft, departureDraft } = vessel;

  if (!pilotageRoute) {
    throw new Error("도선 구간을 선택해 주세요.");
  }

  if (
    arrivalDraft === "" ||
    departureDraft === "" ||
    arrivalDraft == null ||
    departureDraft == null
  ) {
    throw new Error("입항 및 출항 흘수를 입력해 주세요.");
  }

  // 입항 도선료
  const arrival = calculatePilotage({
    port,
    route: pilotageRoute,
    grt,
    draft: arrivalDraft,
  });

  // 출항 도선료
  const departure = calculatePilotage({
    port,
    route: pilotageRoute,
    grt,
    draft: departureDraft,
  });

  return {
    arrival,
    departure,
    subtotal: arrival.subtotal + departure.subtotal,
    totalPilotageFee: arrival.pilotageFee + departure.pilotageFee,
  };
}

// 접·이안 가산료 계산
export function calculateBerthingSurcharge({ port, grt, draft }) {
  const portRates = PILOTAGE_RATES[port];

  if (!portRates) {
    throw new Error("해당 항만의 도선료 요율이 없습니다.");
  }

  const movementRoute = portRates.harborMovementRoute;

  if (!movementRoute) {
    throw new Error("항내이동 도선 구간이 설정되지 않았습니다.");
  }

  // 기존 도선료 계산 함수를 재사용
  const movementResult = calculatePilotage({
    port,
    route: movementRoute,
    grt,
    draft,
  });

  // 항내이동요금의 30%
  const surcharge = Math.trunc(movementResult.subtotal * 0.3);

  return {
    movementFee: movementResult.subtotal,
    surcharge,
  };
}
// 입항 접안 / 출항 이안 가산료 계산
export function calculateRoundTripBerthingSurcharge(vessel) {
  const {
    port,
    grt,
    arrivalDraft,
    departureDraft,
    arrivalBerthing = true,
    departureUnberthing = true,
  } = vessel;

  // 입항 접안 가산료
  const arrival = arrivalBerthing
    ? calculateBerthingSurcharge({
        port,
        grt,
        draft: arrivalDraft,
      })
    : { movementFee: 0, surcharge: 0 };

  // 출항 이안 가산료
  const departure = departureUnberthing
    ? calculateBerthingSurcharge({
        port,
        grt,
        draft: departureDraft,
      })
    : { movementFee: 0, surcharge: 0 };

  return {
    arrival,
    departure,
    totalSurcharge: arrival.surcharge + departure.surcharge,
  };
}

// 가산료 및 할인 반영 후 최저 도선료 적용
export function calculateFinalPilotageFee({
  basicPilotage,
  berthingSurcharge = 0,
  otherSurcharges = 0,
  discounts = 0,
  minimumFee = 270000,
}) {
  const calculatedFee =
    basicPilotage + berthingSurcharge + otherSurcharges - discounts;

  const finalFee = Math.max(calculatedFee, minimumFee);

  return {
    calculatedFee,
    minimumFee,
    finalFee: Math.trunc(finalFee),
  };
}

export function calculateFinalRoundTripPilotage(vessel) {
  // 입항·출항 기본 도선료
  const pilotage = calculateRoundTripPilotage(vessel);

  // 접·이안 가산료
  const berthing = calculateRoundTripBerthingSurcharge(vessel);

  // 야간·공휴일 할증료
  const arrivalTime = calculateTimeSurcharge({
    basicPilotage: pilotage.arrival.subtotal,
    isNight: vessel.arrivalNight,
    isHoliday: vessel.arrivalHoliday,
  });

  const departureTime = calculateTimeSurcharge({
    basicPilotage: pilotage.departure.subtotal,
    isNight: vessel.departureNight,
    isHoliday: vessel.departureHoliday,
  });
  // 입항 위험물 할증
  const arrivalDangerous = calculateDangerousCargoSurcharge({
    basicPilotage: pilotage.arrival.subtotal,
    isDangerousCargo: vessel.arrivalDangerousCargo,
  });

  // 출항 위험물 할증
  const departureDangerous = calculateDangerousCargoSurcharge({
    basicPilotage: pilotage.departure.subtotal,
    isDangerousCargo: vessel.departureDangerousCargo,
  });

  // 입항 최종 도선료
  const arrival = calculateFinalPilotageFee({
    basicPilotage: pilotage.arrival.subtotal,
    berthingSurcharge: berthing.arrival.surcharge,
    otherSurcharges: arrivalTime.surcharge + arrivalDangerous.surcharge,
  });

  // 출항 최종 도선료
  const departure = calculateFinalPilotageFee({
    basicPilotage: pilotage.departure.subtotal,
    berthingSurcharge: berthing.departure.surcharge,
    otherSurcharges: departureTime.surcharge + departureDangerous.surcharge,
  });

  return {
    arrival,
    departure,
    arrivalTime,
    departureTime,
    totalTimeSurcharge: arrivalTime.surcharge + departureTime.surcharge,
    totalFinalPilotageFee: arrival.finalFee + departure.finalFee,
    arrivalDangerous,
    departureDangerous,
    totalDangerousSurcharge:
      arrivalDangerous.surcharge + departureDangerous.surcharge,
  };
}
// 야간 / 공휴일 도선료 할증 계산
export function calculateTimeSurcharge({
  basicPilotage,
  isNight = false,
  isHoliday = false,
}) {
  const basicFee = Number(basicPilotage);

  if (!Number.isFinite(basicFee) || basicFee < 0) {
    throw new Error("기본 도선료를 확인해 주세요.");
  }

  // 공휴일 야간에는 야간 할증만 적용
  const surchargeRate = isNight ? 0.5 : isHoliday ? 0.3 : 0;

  const surcharge = Math.trunc(basicFee * surchargeRate);

  return {
    surchargeRate,
    surcharge,
  };
}

// 위험물 할증 계산 (현재 20% 가정)
export function calculateDangerousCargoSurcharge({
  basicPilotage,
  isDangerousCargo = false,
}) {
  const basicFee = Number(basicPilotage);

  if (!Number.isFinite(basicFee) || basicFee < 0) {
    throw new Error("기본 도선료를 확인해 주세요.");
  }

  const surchargeRate = isDangerousCargo ? 0.2 : 0;
  const surcharge = Math.trunc(basicFee * surchargeRate);

  return {
    surchargeRate,
    surcharge,
  };
}
