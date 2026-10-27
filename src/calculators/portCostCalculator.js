import { PORT_RATES } from "../data/portRates";
/**
 * Port Cost Calculator
 *
 * 주의:
 * - 실제 청구에 필요한 단수 처리 및 감면 규정은 미반영
 * - 접안료 (나) 기타 선박은 계산 대상에서 제외
 */

export function calculatePortCost(vessel) {
  const gt = Number(vessel.grt);
  const portCalls = Number(vessel.portCalls);
  const berthHours = Number(vessel.berthHours);
  const pilotage = Number(vessel.pilotage || 0);
  const tugboat = Number(vessel.tugboat || 0);

  const vesselType = vessel.vesselType || "OCEAN";
  const rates = PORT_RATES[vessel.port];

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

  // 1. 선박입출항료
  const portDues = gt * rates.portDuesPerGt * portCalls;

  // 2. 접안료
  const rate = rates.berthDues[vesselType];
  //const rate = PORT_RATES.berthDues[vesselType];

  // 10GT당 요율
  const gtUnits = Math.ceil(gt / 10); //10GT 단위 올림
  // 현재 접안료 요율 적용 대상 여부
  const berthApplicable = gt >= 150;

  let berthDues = 0;
  let basicDues = 0;
  let extraDues = 0;
  let extraHours = 0;

  if (berthApplicable && berthHours > 0) {
    // 최초 12시간 기본료
    basicDues = gtUnits * rate.basicRate;

    // 12시간 초과분을 1시간 단위로 올림
    extraHours = Math.ceil(Math.max(0, berthHours - 12));

    // 초과사용료
    extraDues = gtUnits * extraHours * rate.extraRate;

    // 접안료 합산 후 원 미만 절사 (임시 정책)
    berthDues = Math.trunc(basicDues + extraDues);
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
    berthApplicable,
  };
}
