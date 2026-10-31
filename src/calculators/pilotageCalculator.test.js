import {
  calculatePilotage,
  calculateRoundTripPilotage,
  calculateBerthingSurcharge,
  calculateRoundTripBerthingSurcharge,
  calculateFinalPilotageFee,
  calculateFinalRoundTripPilotage,
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

// 접·이안 가산료 계산 테스트
const berthingTest = calculateBerthingSurcharge({
  port: "INCHEON",
  grt: 20000,
  draft: 10,
});

console.log("\n=== Berthing Surcharge Test ===");
console.log("항내이동요금:", berthingTest.movementFee);
console.log("접·이안 가산료 (30%):", berthingTest.surcharge);

// 입항 접안 / 출항 이안 가산료 테스트
const roundTripBerthingTest = calculateRoundTripBerthingSurcharge({
  port: "INCHEON",
  grt: 20000,
  arrivalDraft: 10,
  departureDraft: 6,
});

console.log("\n=== Round Trip Berthing Surcharge Test ===");
console.log("입항 접안 가산료:", roundTripBerthingTest.arrival.surcharge);
console.log("출항 이안 가산료:", roundTripBerthingTest.departure.surcharge);
console.log("접·이안 가산료 합계:", roundTripBerthingTest.totalSurcharge);

// 입항 접안만 선택한 경우
const checkboxTest = calculateRoundTripBerthingSurcharge({
  port: "INCHEON",
  grt: 20000,
  arrivalDraft: 10,
  departureDraft: 6,
  arrivalBerthing: true,
  departureUnberthing: false,
});

console.log("\n=== Berthing Checkbox Test ===");
console.log("입항 접안:", checkboxTest.arrival.surcharge);
console.log("출항 이안:", checkboxTest.departure.surcharge);
console.log("가산료 합계:", checkboxTest.totalSurcharge);

// 최저 도선료 적용 순서 검증
const finalFeeTest = calculateFinalPilotageFee({
  basicPilotage: 200000,
  berthingSurcharge: 60000,
});

console.log("\n=== Final Pilotage Fee Test ===");
console.log("가산료 포함 금액:", finalFeeTest.calculatedFee);
console.log("최저 도선료:", finalFeeTest.minimumFee);
console.log("최종 도선료:", finalFeeTest.finalFee);

const finalRoundTripTest = calculateFinalRoundTripPilotage({
  port: "INCHEON",
  pilotageRoute: "PALMI_NORTH_PORT",
  grt: 20000,
  arrivalDraft: 10,
  departureDraft: 6,
  arrivalBerthing: true,
  departureUnberthing: true,
});

console.log("\n=== Final Round Trip Pilotage Test ===");
console.log("입항 최종 도선료:", finalRoundTripTest.arrival.finalFee);
console.log("출항 최종 도선료:", finalRoundTripTest.departure.finalFee);
console.log("왕복 최종 도선료:", finalRoundTripTest.totalFinalPilotageFee);
