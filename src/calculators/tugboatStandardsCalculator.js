import { TUGBOAT_STANDARDS } from "../data/tugboatStandards.js";

// GT에 따른 예상 갑문 선택
export function getEstimatedGate(grt) {
  const gt = Number(grt);

  if (!Number.isFinite(gt) || gt <= 0) {
    throw new Error("GT를 올바르게 입력해 주세요.");
  }

  return gt >= 10000 ? "gate50k" : "gate10k";
}

// GT에 해당하는 예선 사용 기준 조회
export function getTugboatStandard(port, grt) {
  const standards = TUGBOAT_STANDARDS[port];

  if (!standards) {
    throw new Error("예선 사용 기준이 없는 항만입니다.");
  }

  const gt = Number(grt);

  if (!Number.isFinite(gt) || gt <= 0) {
    throw new Error("GT를 올바르게 입력해 주세요.");
  }

  const standard = standards.find(
    (item) => gt >= item.minGt && (item.maxGt === null || gt < item.maxGt),
  );

  if (!standard) {
    throw new Error("해당 GT의 예선 사용 기준이 없습니다.");
  }

  return standard;
}

// GT 기준 예상 갑문 및 예선 사용 기준
export function getEstimatedTugboatStandard(port, grt) {
  const standard = getTugboatStandard(port, grt);
  const gate = getEstimatedGate(grt);

  return {
    gate,
    gateArrival: standard[gate]?.arrival ?? null,
    gateDeparture: standard[gate]?.departure ?? null,
    innerBerthing: standard.innerBerthing,
    outerBerthing: standard.outerBerthing,
  };
}

export function getTugboatWorkStandards(port, grt, pilotageRoute) {
  const standard = getEstimatedTugboatStandard(port, grt);

  if (pilotageRoute === "PALMI_INNER_HARBOR") {
    if (
      !standard.gateArrival ||
      !standard.gateDeparture ||
      !standard.innerBerthing
    ) {
      throw new Error("해당 GT의 내항 예선 사용 기준이 없습니다.");
    }

    return {
      workType: "INNER_HARBOR",
      arrival: [
        { type: "GATE", ...standard.gateArrival },
        { type: "BERTHING", ...standard.innerBerthing },
      ],
      departure: [
        { type: "UNBERTHING", ...standard.innerBerthing },
        { type: "GATE", ...standard.gateDeparture },
      ],
    };
  }

  if (
    ["PALMI_NORTH_PORT", "PALMI_SOUTH_PORT", "NEW_PORT"].includes(pilotageRoute)
  ) {
    if (!standard.outerBerthing) {
      throw new Error("해당 GT의 외항 예선 사용 기준이 없습니다.");
    }

    return {
      workType: "OUTER_HARBOR",
      arrival: [{ type: "BERTHING", ...standard.outerBerthing }],
      departure: [{ type: "UNBERTHING", ...standard.outerBerthing }],
    };
  }

  throw new Error("예선 사용 기준이 정의되지 않은 도선구간입니다.");
}
