import { PORT_RATES } from "../data/portRates";
/**
 * Port Cost Calculator
 *
 * 주의:
 * - 예상항비 산정용 계산기
 * - 접안료 GT 및 시간 단수 처리 적용
 * - 기타 선박 접안료는 1개월 이하 사용 기준으로 계산
 * - 감면 및 기타 실제 청구 조건은 미반영
 */

export function calculatePortCost(vessel) {
  const gt = Number(vessel.grt);
  const portCalls = Number(vessel.portCalls);
  const berthHours = Number(vessel.berthHours);
  const pilotage = Number(vessel.pilotage || 0);
  const tugboat = Number(vessel.tugboat || 0);

  const vesselType = vessel.vesselType || "OCEAN";
  const rates = PORT_RATES[vessel.port];
  const vesselCategory = vessel.vesselCategory || "GENERAL";

  // 입력값 검증
  const values = [gt, portCalls, berthHours, pilotage, tugboat];

  if (!values.every(Number.isFinite)) {
    throw new Error("숫자 입력값을 확인해 주세요.");
  }

  if (gt <= 0 || values.slice(1).some((v) => v < 0)) {
    throw new Error("GT, 시간 및 금액을 확인해 주세요.");
  }

  if (![0, 1, 2].includes(portCalls)) {
    throw new Error("입출항 횟수가 올바르지 않습니다.");
  }

  if (!["OCEAN", "COASTAL"].includes(vesselType)) {
    throw new Error("선박 구분을 확인해 주세요.");
  }
  if (!rates) {
    throw new Error("해당 항만의 요율 정보가 없습니다.");
  }

  if (!["GENERAL", "HARBOR", "PASSENGER"].includes(vesselCategory)) {
    throw new Error("선박 용도를 확인해 주세요.");
  }

  // 1. 선박입출항료
  const portDues = gt * rates.portDuesPerGt * portCalls;

  // 2. 접안료

  const berthType =
    vesselCategory === "GENERAL" && gt >= 150 ? "STANDARD" : "OTHER";

  let berthDues = 0;
  let basicDues = 0;
  let extraDues = 0;
  let extraHours = 0;

  //if (berthApplicable && berthHours > 0) {

  if (berthType === "STANDARD") {
    // 일반 선박 접안료
    const rate = rates.berthDues[vesselType];
    const gtUnits = Math.ceil(gt / 10);

    if (berthHours > 0) {
      basicDues = gtUnits * rate.basicRate;
      extraHours = Math.ceil(Math.max(0, berthHours - 12));
      extraDues = gtUnits * extraHours * rate.extraRate;

      berthDues = Math.trunc(basicDues + extraDues);
    }
  } else {
    // 기타 선박 접안료 (1개월 이하 사용 가정)
    const otherRate = rates.otherBerthDues[vesselCategory];

    if (otherRate === undefined) {
      throw new Error("해당 선박 용도의 접안료 요율이 없습니다.");
    }

    if (berthHours > 0) {
      const extraGtUnits = Math.max(0, Math.ceil(gt / 50) - 1);

      berthDues = Math.trunc(otherRate + otherRate * 0.5 * extraGtUnits);
    }
  }

  // 3. 총 예상항비
  const total = portDues + berthDues + pilotage + tugboat;

  return {
    portDues,
    berthDues,
    basicDues,
    extraDues,
    berthHours,
    extraHours,
    pilotage,
    tugboat,
    total,
    berthType,
  };
}
