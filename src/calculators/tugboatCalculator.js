import { TUGBOAT_RATES } from "../data/tugboatRates.js";
import { getTugboatWorkStandards } from "./tugboatStandardsCalculator.js";

// 총마력과 척수에 따른 예상 예선 마력 배분
export function distributeTugboatHorsepower(totalHp, count) {
  if (
    !Number.isFinite(totalHp) ||
    !Number.isInteger(count) ||
    totalHp <= 0 ||
    count <= 0
  ) {
    throw new Error("예선 총마력 또는 척수가 올바르지 않습니다.");
  }

  const unitHp = 500;

  // 총마력을 충족하기 위해 필요한 500HP 단위 수
  const totalUnits = Math.ceil(totalHp / unitHp);

  // 모든 예선에 최소 500HP씩 배분
  if (totalUnits < count) {
    throw new Error("예선 척수에 비해 총마력이 부족합니다.");
  }

  const baseUnits = Math.floor(totalUnits / count);
  const remainder = totalUnits % count;

  const horsepowerList = Array.from(
    { length: count },
    (_, index) => (baseUnits + (index < remainder ? 1 : 0)) * unitHp,
  );

  return horsepowerList;
}

// 예선 1척의 기본요금 조회
export function getTugboatBaseFee(port, vesselType, horsepower) {
  const rates = TUGBOAT_RATES[port];

  if (!rates) {
    throw new Error("예선료 요율이 없는 항만입니다.");
  }

  const fee = rates.baseRates[horsepower]?.[vesselType];

  if (fee === undefined) {
    throw new Error(
      `예선 기본요금이 없습니다: ${horsepower}HP / ${vesselType}`,
    );
  }

  return fee;
}

// 예선 작업 1건의 기본요금 계산
export function calculateTugboatWorkBaseFee({
  port,
  vesselType,
  totalHp,
  count,
}) {
  const horsepowerList = distributeTugboatHorsepower(totalHp, count);

  const tugboats = horsepowerList.map((horsepower, index) => ({
    tugboatNo: index + 1,
    horsepower,
    baseFee: getTugboatBaseFee(port, vesselType, horsepower),
  }));

  const totalBaseFee = tugboats.reduce(
    (sum, tugboat) => sum + tugboat.baseFee,
    0,
  );

  return {
    requiredTotalHp: totalHp,
    requiredCount: count,
    estimatedTotalHp: horsepowerList.reduce((sum, hp) => sum + hp, 0),
    tugboats,
    totalBaseFee,
  };
}

export function calculateRoundTripTugboatBaseFee({
  port,
  grt,
  vesselType,
  pilotageRoute,
}) {
  const standards = getTugboatWorkStandards(port, grt, pilotageRoute);

  const calculateWorks = (works) =>
    works.map((work) => ({
      type: work.type,
      ...calculateTugboatWorkBaseFee({
        port,
        vesselType,
        totalHp: work.hp ?? work.hpMin,
        count: work.count ?? work.countMin,
      }),
    }));

  const arrival = calculateWorks(standards.arrival);
  const departure = calculateWorks(standards.departure);

  const arrivalTotal = arrival.reduce(
    (sum, work) => sum + work.totalBaseFee,
    0,
  );

  const departureTotal = departure.reduce(
    (sum, work) => sum + work.totalBaseFee,
    0,
  );

  return {
    workType: standards.workType,
    arrival,
    departure,
    arrivalTotal,
    departureTotal,
    totalBaseFee: arrivalTotal + departureTotal,
  };
}

/**
 * 일반 예선 작업 사용시간에 따른 요금 계산
 *
 * 최초 60분: 기본요금 100%
 * 이후 30분마다: 기본요금 50% 추가
 *
 * 갑문 통과 작업에는 적용하지 않음
 */
export function calculateTugboatTimeFee(baseFee, minutes) {
  if (
    !Number.isFinite(baseFee) ||
    !Number.isFinite(minutes) ||
    baseFee < 0 ||
    minutes <= 0
  ) {
    throw new Error("예선 기본요금 또는 사용시간이 올바르지 않습니다.");
  }

  const extraMinutes = Math.max(0, minutes - 60);
  const extraUnits = Math.ceil(extraMinutes / 30);

  const extraFee = Math.round(baseFee * 0.5 * extraUnits);

  return {
    baseFee,
    minutes,
    extraUnits,
    extraFee,
    totalFee: baseFee + extraFee,
  };
}

/**
 * 갑문 통과 예선 사용시간 요금
 *
 * 30분마다 기본요금의 50% 적용
 * 30분 미만도 30분으로 올림
 */
export function calculateTugboatGateTimeFee(baseFee, minutes) {
  if (
    !Number.isFinite(baseFee) ||
    !Number.isFinite(minutes) ||
    baseFee < 0 ||
    minutes <= 0
  ) {
    throw new Error("갑문 예선 기본요금 또는 사용시간이 올바르지 않습니다.");
  }

  const units = Math.ceil(minutes / 30);
  const totalFee = Math.round(baseFee * 0.5 * units);

  return {
    baseFee,
    minutes,
    units,
    totalFee,
  };
}

/**
 * 예선료 할증 계산
 *
 * 야간·휴일 중복 시 휴일 할증만 적용
 * 위험화물 할증은 별도 가산
 *
 * 적용 여부는 외부에서 판단해 전달
 */
export function calculateTugboatSurcharge({
  baseFee,
  isNight = false,
  isHoliday = false,
  isDangerousCargo = false,
}) {
  if (!Number.isFinite(baseFee) || baseFee < 0) {
    throw new Error("예선 기본요금이 올바르지 않습니다.");
  }

  const nightRate = isNight && !isHoliday ? 0.3 : 0;
  const holidayRate = isHoliday ? 0.3 : 0;
  const dangerousRate = isDangerousCargo ? 0.3 : 0;

  const nightFee = Math.round(baseFee * nightRate);
  const holidayFee = Math.round(baseFee * holidayRate);
  const dangerousFee = Math.round(baseFee * dangerousRate);

  return {
    baseFee,
    nightFee,
    holidayFee,
    dangerousFee,
    totalSurcharge: nightFee + holidayFee + dangerousFee,
  };
}

/**
 * 예선 작업 1건의 예상요금 계산
 *
 * GATE: 갑문 통과 (30분 단위)
 * BERTHING / UNBERTHING: 일반 작업 (최초 1시간)
 *
 * 할증은 최초 1시간 기본요금 기준
 */
export function calculateTugboatWorkFee({
  port,
  vesselType,
  type,
  totalHp,
  count,
  minutes,
  isNight = false,
  isHoliday = false,
  isDangerousCargo = false,
}) {
  if (!["GATE", "BERTHING", "UNBERTHING"].includes(type)) {
    throw new Error("지원하지 않는 예선 작업 유형입니다.");
  }

  const work = calculateTugboatWorkBaseFee({
    port,
    vesselType,
    totalHp,
    count,
  });

  const timeResult =
    type === "GATE"
      ? calculateTugboatGateTimeFee(work.totalBaseFee, minutes)
      : calculateTugboatTimeFee(work.totalBaseFee, minutes);

  const surchargeResult = calculateTugboatSurcharge({
    baseFee: work.totalBaseFee,
    isNight,
    isHoliday,
    isDangerousCargo,
  });

  return {
    type,
    ...work,
    minutes,
    timeFee: timeResult.totalFee,
    ...surchargeResult,
    totalFee: timeResult.totalFee + surchargeResult.totalSurcharge,
  };
}

/**
 * 입항·출항 전체 예상 예선료 계산
 *
 * 작업별 사용시간 및 할증 조건을 적용한다.
 * 갑문 통과와 접·이안은 각각 별도 계산한다.
 */
export function calculateRoundTripTugboatFee({
  port,
  grt,
  vesselType,
  pilotageRoute,
  arrival = {},
  departure = {},
}) {
  const standards = getTugboatWorkStandards(port, grt, pilotageRoute);

  const calculateWorks = (works, options) =>
    works.map((work) => {
      const isGate = work.type === "GATE";

      const minutes = isGate ? options.gateMinutes : options.berthingMinutes;

      if (!Number.isFinite(minutes) || minutes <= 0) {
        throw new Error(`${work.type} 예선 사용시간을 입력해 주세요.`);
      }

      return calculateTugboatWorkFee({
        port,
        vesselType,
        type: work.type,
        totalHp: work.hp ?? work.hpMin,
        count: work.count ?? work.countMin,
        minutes,
        isNight: options.isNight ?? false,
        isHoliday: options.isHoliday ?? false,
        isDangerousCargo: options.isDangerousCargo ?? false,
      });
    });

  const arrivalWorks = calculateWorks(standards.arrival, arrival);

  const departureWorks = calculateWorks(standards.departure, departure);

  const arrivalTotal = arrivalWorks.reduce(
    (sum, work) => sum + work.totalFee,
    0,
  );

  const departureTotal = departureWorks.reduce(
    (sum, work) => sum + work.totalFee,
    0,
  );

  return {
    workType: standards.workType,
    arrival: arrivalWorks,
    departure: departureWorks,
    arrivalTotal,
    departureTotal,
    totalTugboatFee: arrivalTotal + departureTotal,
  };
}
