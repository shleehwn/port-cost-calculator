import { ANCHORAGE_RATES } from "../data/anchorageRates";

export function calculateAnchorageDues({
  port = "INCHEON",
  vesselType = "OCEAN",
  grt,
  anchorageHours,
  isBunkering = false,
  hasEdiApproval = false,
}) {
  const gt = Number(grt);
  const hours = Number(anchorageHours);

  if (!Number.isFinite(gt) || gt <= 0) {
    throw new Error("GT를 올바르게 입력해주세요.");
  }

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("정박시간을 올바르게 입력해주세요.");
  }

  const rates = ANCHORAGE_RATES[port]?.[vesselType];

  if (!rates) {
    throw new Error("해당 항만 또는 선박 구분의 정박료 요율이 없습니다.");
  }

  // 벙커링 목적 + 사전 EDI 허가 + 24시간 이내
  const isExempt = isBunkering && hasEdiApproval && hours <= 24;

  const basicFee = Math.ceil(gt / 10) * rates.basicRatePer10Gt;

  // 12시간 초과 시 1시간 미만 단수 올림
  const extraHours = Math.ceil(Math.max(0, hours - rates.basicHours));

  const extraFee = gt * extraHours * rates.extraRatePerGtHour;

  const normalFee = Math.trunc(basicFee + extraFee);

  return {
    anchorageHours: hours,
    basicFee,
    extraHours,
    extraFee,
    normalFee,
    isExempt,
    anchorageFee: isExempt ? 0 : normalFee,
    retroactivePortDuesRequired: isBunkering && hasEdiApproval && hours > 24,
  };
}
