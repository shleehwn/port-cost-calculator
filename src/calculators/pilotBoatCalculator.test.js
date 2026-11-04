import {
  calculatePilotBoatFee,
  calculateRoundTripPilotBoatFee,
} from "./pilotBoatCalculator.js";

// 1. 팔미도 → 북항 (입항, 할증 없음)
const northPort = calculatePilotBoatFee({
  port: "INCHEON",
  route: "PALMI_NORTH_PORT",
  isNight: false,
  isHoliday: false,
});

// 2. 팔미도 → 남항 (입항, 할증 없음)
const southPort = calculatePilotBoatFee({
  port: "INCHEON",
  route: "PALMI_SOUTH_PORT",
  isNight: false,
  isHoliday: false,
});

console.log("=== 도선선료 자동 매핑 테스트 ===");
console.log("팔미도 → 북항:", northPort.baseFee);
console.log("팔미도 → 남항:", southPort.baseFee);

// 3. 왕복 계산 (북항, 입항 야간 50%)
const roundTrip = calculateRoundTripPilotBoatFee({
  port: "INCHEON",
  pilotageRoute: "PALMI_NORTH_PORT",
  arrivalNight: true,
  arrivalHoliday: false,
  departureNight: false,
  departureHoliday: false,
});

console.log("\n=== 왕복 도선선료 테스트 ===");
console.log("입항 도선선료:", roundTrip.arrival.finalFee);
console.log("출항 도선선료:", roundTrip.departure.finalFee);
console.log("왕복 도선선료:", roundTrip.totalPilotBoatFee);

// 4. 결과 검증
if (
  northPort.baseFee !== 499860 ||
  southPort.baseFee !== 463660 ||
  roundTrip.arrival.finalFee !== 749790 ||
  roundTrip.departure.finalFee !== 499860 ||
  roundTrip.totalPilotBoatFee !== 1249650
) {
  throw new Error("도선선료 자동 매핑 계산 결과가 일치하지 않습니다.");
}
// 5. 팔미도 → 내항 CAR SERVICE 테스트
const innerHarbor = calculatePilotBoatFee({
  port: "INCHEON",
  route: "PALMI_INNER_HARBOR",
  isNight: false,
  isHoliday: false,
});

console.log("\n=== 내항 도선선료 테스트 ===");
console.log("기본 도선선료:", innerHarbor.baseFee);
console.log("CAR SERVICE:", innerHarbor.carServiceFee);
console.log("최종 도선선료:", innerHarbor.finalFee);

// 예상 금액 검증
if (
  innerHarbor.baseFee !== 340430 ||
  innerHarbor.carServiceFee !== 54800 ||
  innerHarbor.finalFee !== 395230
) {
  throw new Error("내항 도선선료 계산 결과가 일치하지 않습니다.");
}
console.log("\n모든 테스트 통과!");

// 팔미도 → 정박지 도선선료 테스트
const anchorage = calculatePilotBoatFee({
  port: "INCHEON",
  route: "PALMI_ANCHORAGE",
  isNight: false,
  isHoliday: false,
});

console.log("\n=== 정박지 도선선료 테스트 ===");
console.log("기본 도선선료:", anchorage.baseFee);
console.log("최종 도선선료:", anchorage.finalFee);

if (anchorage.baseFee !== 481760 || anchorage.finalFee !== 481760) {
  throw new Error("정박지 도선선료 계산 결과가 일치하지 않습니다.");
}
// 인천신항 도선선료 테스트
const newPort = calculatePilotBoatFee({
  port: "INCHEON",
  route: "NEW_PORT",
  isNight: false,
  isHoliday: false,
});

console.log("\n=== 인천신항 도선선료 테스트 ===");
console.log("기본 도선선료:", newPort.baseFee);
console.log("최종 도선선료:", newPort.finalFee);

if (newPort.baseFee !== 735160 || newPort.finalFee !== 735160) {
  throw new Error("인천신항 도선선료 계산 결과가 일치하지 않습니다.");
}
