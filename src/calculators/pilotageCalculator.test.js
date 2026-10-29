import {
  calculatePilotage,
  calculateRoundTripPilotage,
} from "./pilotageCalculator.js";

// 인천항 북항 도선 테스트
const result = calculatePilotage({
  port: "INCHEON",
  route: "PALMI_NORTH_PORT",
  grt: 20000,
  draft: 10,
});

console.log("=== Pilotage Calculation Test ===");
console.log("기본료:", result.baseRate);
console.log("GT 초과 단위:", result.extraGtUnits);
console.log("Draft 초과 단위:", result.extraDraftUnits);
console.log("GT 초과료:", result.gtSurcharge);
console.log("Draft 초과료:", result.draftSurcharge);
console.log("도선료 소계:", result.subtotal);

// 입항 / 출항 도선료 테스트
const roundTripResult = calculateRoundTripPilotage({
  port: "INCHEON",
  pilotageRoute: "PALMI_NORTH_PORT",
  grt: 20000,
  arrivalDraft: 10,
  departureDraft: 6,
});

console.log("\n=== Round Trip Pilotage Test ===");
console.log("입항 도선료:", roundTripResult.arrival.subtotal);
console.log("출항 도선료:", roundTripResult.departure.subtotal);
console.log("왕복 도선료 합계:", roundTripResult.subtotal);

const minimumFeeTest = calculateRoundTripPilotage({
  port: "INCHEON",
  pilotageRoute: "PALMI_NORTH_PORT",
  grt: 1000,
  arrivalDraft: 3,
  departureDraft: 3,
});

console.log("\n=== Minimum Pilotage Fee Test ===");
console.log("입항 도선료:", minimumFeeTest.arrival.pilotageFee);
console.log("출항 도선료:", minimumFeeTest.departure.pilotageFee);
console.log("왕복 최저 도선료 적용 합계:", minimumFeeTest.totalPilotageFee);
