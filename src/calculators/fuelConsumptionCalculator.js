import { getBulkCarrierFuelProfile } from "../data/vesselFuelProfiles";

/**
 * 벌크선 항해 중 주기관 연료 소모량 계산
 *
 * 기준 선속 대비 실제 선속의 세제곱 비율 적용
 *
 * 현재 범위:
 * - Laden 기준
 * - Main Engine 연료만 계산
 * - 정박 연료 제외
 *
 * @returns {object}
 */
export function calculateSeaFuelConsumption({
  dwt,
  distanceNm,
  speedKnots,
  seaMargin = 5,
}) {
  const profile = getBulkCarrierFuelProfile(dwt);

  if (!profile) {
    throw new Error("해당 DWT의 벌크선 기준 데이터가 없습니다.");
  }

  const distance = Number(distanceNm);
  const speed = Number(speedKnots);
  const margin = Number(seaMargin);

  if (
    !Number.isFinite(distance) ||
    !Number.isFinite(speed) ||
    !Number.isFinite(margin) ||
    distance <= 0 ||
    speed <= 0 ||
    margin < 0 ||
    margin > 100
  ) {
    throw new Error("항해 거리, 선속, Sea Margin 값을 확인해주세요.");
  }

  // 항해 일수 (Sea Margin을 시간 증가율로 적용)
  const seaDays = (distance / speed / 24) * (1 + margin / 100);

  // 기준 선속 대비 주기관 일일 연료 소모량 보정
  const speedRatio = speed / profile.referenceSpeed;

  const mainEngineDaily = profile.mainEngineDaily * Math.pow(speedRatio, 3);

  // 총 항해 중 주기관 연료 소모량
  const mainEngineTotal = seaDays * mainEngineDaily;

  return {
    vesselClass: profile.name,
    dwt: Number(dwt),
    referenceSpeed: profile.referenceSpeed,
    actualSpeed: speed,
    distanceNm: distance,
    seaMargin: margin,
    seaDays,
    mainEngineDaily,
    mainEngineTotal,
  };
}

/**
 * 항해 및 정박 중 연료 소모량과 연료비 계산
 *
 * - 항해 주기관: VLSFO
 * - 항해 발전기: MGO
 * - 정박 Idle/Working: MGO
 *
 * 모든 연료 소모량은 MT/day
 * 모든 유가는 USD/MT
 */
export function calculateVoyageFuelCost({
  dwt,
  distanceNm,
  speedKnots,
  seaMargin = 5,

  auxiliaryDaily = 1.5,
  idleDays = 0,
  workingDays = 0,
  idleDaily = 2.5,
  workingDaily = 5,

  vlsfoPrice = 600,
  mgoPrice = 800,
}) {
  const sea = calculateSeaFuelConsumption({
    dwt,
    distanceNm,
    speedKnots,
    seaMargin,
  });

  const inputs = {
    auxiliaryDaily,
    idleDays,
    workingDays,
    idleDaily,
    workingDaily,
    vlsfoPrice,
    mgoPrice,
  };

  // 숫자 및 음수 입력 검증
  for (const [key, value] of Object.entries(inputs)) {
    if (
      value === "" ||
      value === null ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0
    ) {
      throw new Error(`${key} 입력값을 확인해주세요.`);
    }
  }

  const auxiliaryFuel = sea.seaDays * Number(auxiliaryDaily);

  const idleFuel = Number(idleDays) * Number(idleDaily);

  const workingFuel = Number(workingDays) * Number(workingDaily);

  const vlsfoTotal = sea.mainEngineTotal;

  const mgoTotal = auxiliaryFuel + idleFuel + workingFuel;

  const totalFuel = vlsfoTotal + mgoTotal;

  const vlsfoCost = vlsfoTotal * Number(vlsfoPrice);

  const mgoCost = mgoTotal * Number(mgoPrice);

  return {
    ...sea,

    auxiliaryFuel,
    idleFuel,
    workingFuel,

    vlsfoTotal,
    mgoTotal,
    totalFuel,

    vlsfoCost,
    mgoCost,
    totalCost: vlsfoCost + mgoCost,
  };
}

/**
 * 운항 상태별·유종별 연료비 계산
 *
 * - DWT별 연료 소비량 자동 추천
 * - 사용자가 입력한 값 우선 적용
 * - 항해 VLSFO는 기준 선속 대비 세제곱 보정
 * - 수동 입력한 항해 VLSFO는 현재 선속 기준으로 간주
 *
 * 소비량: MT/day
 * 가격: USD/MT
 */
export function calculateFuelCostByOperation({
  dwt,
  distanceNm,
  speedKnots,
  seaMargin = 5,

  seaVlsfoDaily,
  seaMgoDaily,

  idleDays = 0,
  idleVlsfoDaily,
  idleMgoDaily,

  workingDays = 0,
  workingVlsfoDaily,
  workingMgoDaily,

  vlsfoPrice = 600,
  mgoPrice = 800,
}) {
  const sea = calculateSeaFuelConsumption({
    dwt,
    distanceNm,
    speedKnots,
    seaMargin,
  });

  const profile = getBulkCarrierFuelProfile(dwt);

  // undefined일 때만 자동 추천값 적용
  // 0은 사용자가 의도적으로 입력한 값이므로 유지
  const applied = {
    seaVlsfoDaily:
      seaVlsfoDaily === undefined ? sea.mainEngineDaily : seaVlsfoDaily,

    seaMgoDaily:
      seaMgoDaily === undefined ? profile.fuelRates.seaMgoDaily : seaMgoDaily,

    idleVlsfoDaily:
      idleVlsfoDaily === undefined
        ? profile.fuelRates.idleVlsfoDaily
        : idleVlsfoDaily,

    idleMgoDaily:
      idleMgoDaily === undefined
        ? profile.fuelRates.idleMgoDaily
        : idleMgoDaily,

    workingVlsfoDaily:
      workingVlsfoDaily === undefined
        ? profile.fuelRates.workingVlsfoDaily
        : workingVlsfoDaily,

    workingMgoDaily:
      workingMgoDaily === undefined
        ? profile.fuelRates.workingMgoDaily
        : workingMgoDaily,
  };

  // 입력값 검증
  const values = {
    ...applied,
    idleDays,
    workingDays,
    vlsfoPrice,
    mgoPrice,
  };

  for (const [key, value] of Object.entries(values)) {
    if (
      value === "" ||
      value === null ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0
    ) {
      throw new Error(`${key} 입력값을 확인해주세요.`);
    }
  }

  // 숫자 변환
  const rates = Object.fromEntries(
    Object.entries(applied).map(([key, value]) => [key, Number(value)]),
  );

  const idle = Number(idleDays);
  const working = Number(workingDays);

  // 항해 중
  const seaVlsfoTotal = sea.seaDays * rates.seaVlsfoDaily;

  const seaMgoTotal = sea.seaDays * rates.seaMgoDaily;

  // 정박 대기
  const idleVlsfoTotal = idle * rates.idleVlsfoDaily;

  const idleMgoTotal = idle * rates.idleMgoDaily;

  // 정박 하역
  const workingVlsfoTotal = working * rates.workingVlsfoDaily;

  const workingMgoTotal = working * rates.workingMgoDaily;

  // 유종별 합계
  const vlsfoTotal = seaVlsfoTotal + idleVlsfoTotal + workingVlsfoTotal;

  const mgoTotal = seaMgoTotal + idleMgoTotal + workingMgoTotal;

  const vlsfoCost = vlsfoTotal * Number(vlsfoPrice);

  const mgoCost = mgoTotal * Number(mgoPrice);

  return {
    ...sea,

    // 화면에서 자동 추천값과 실제 적용값 확인용
    appliedFuelRates: rates,
    appliedSeaVlsfoDaily: rates.seaVlsfoDaily,

    seaVlsfoTotal,
    seaMgoTotal,

    idleVlsfoTotal,
    idleMgoTotal,

    workingVlsfoTotal,
    workingMgoTotal,

    vlsfoTotal,
    mgoTotal,
    totalFuel: vlsfoTotal + mgoTotal,

    vlsfoCost,
    mgoCost,
    totalCost: vlsfoCost + mgoCost,
  };
}
