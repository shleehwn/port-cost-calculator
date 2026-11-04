import {
  distributeTugboatHorsepower,
  calculateTugboatWorkBaseFee,
  calculateRoundTripTugboatBaseFee,
  calculateTugboatTimeFee,
  calculateTugboatGateTimeFee,
  calculateTugboatSurcharge,
  calculateTugboatWorkFee,
  calculateRoundTripTugboatFee,
} from "./tugboatCalculator.js";

// 마력 배분 테스트
const cases = [
  { hp: 5500, count: 2, expected: [3000, 2500] },
  { hp: 8000, count: 3, expected: [3000, 2500, 2500] },
  { hp: 7000, count: 3, expected: [2500, 2500, 2000] },
  { hp: 2600, count: 2, expected: [1500, 1500] },
];

for (const test of cases) {
  const result = distributeTugboatHorsepower(test.hp, test.count);

  console.log(`${test.hp}HP / ${test.count}척 → ${result.join(" + ")}HP`);

  if (JSON.stringify(result) !== JSON.stringify(test.expected)) {
    throw new Error(`${test.hp}HP 마력 배분 테스트 실패`);
  }
}

// 북항 20,000GT 선박 접안 기준 예선료 테스트
const northPort = calculateTugboatWorkBaseFee({
  port: "INCHEON",
  vesselType: "OCEAN",
  totalHp: 5500,
  count: 2,
});

console.log("\n=== 북항 접안 예선료 테스트 ===");
console.log(northPort);

if (northPort.totalBaseFee !== 1740210) {
  throw new Error("북항 기본 예선료 계산 결과가 일치하지 않습니다.");
}

console.log("\n모든 예선 마력 배분 및 기본요금 테스트 통과!");

const roundTrip = calculateRoundTripTugboatBaseFee({
  port: "INCHEON",
  grt: 20000,
  vesselType: "OCEAN",
  pilotageRoute: "PALMI_NORTH_PORT",
});

console.log("\n=== 북항 왕복 기본 예선료 ===");
console.log("입항:", roundTrip.arrivalTotal.toLocaleString(), "원");
console.log("출항:", roundTrip.departureTotal.toLocaleString(), "원");
console.log("합계:", roundTrip.totalBaseFee.toLocaleString(), "원");

if (
  roundTrip.arrivalTotal !== 1740210 ||
  roundTrip.departureTotal !== 1740210 ||
  roundTrip.totalBaseFee !== 3480420
) {
  throw new Error("북항 왕복 기본 예선료 테스트 실패");
}

console.log("왕복 기본 예선료 테스트 통과!");

const timeCases = [
  { minutes: 60, expected: 100000 },
  { minutes: 61, expected: 150000 },
  { minutes: 90, expected: 150000 },
  { minutes: 91, expected: 200000 },
  { minutes: 120, expected: 200000 },
];

for (const test of timeCases) {
  const result = calculateTugboatTimeFee(100000, test.minutes);

  console.log(`${test.minutes}분 → ${result.totalFee.toLocaleString()}원`);

  if (result.totalFee !== test.expected) {
    throw new Error(`${test.minutes}분 사용시간 계산 실패`);
  }
}

console.log("예선 사용시간 계산 테스트 통과!");

const gateCases = [
  { minutes: 1, expected: 50000 },
  { minutes: 30, expected: 50000 },
  { minutes: 31, expected: 100000 },
  { minutes: 60, expected: 100000 },
  { minutes: 61, expected: 150000 },
  { minutes: 90, expected: 150000 },
  { minutes: 120, expected: 200000 },
];

for (const test of gateCases) {
  const result = calculateTugboatGateTimeFee(100000, test.minutes);

  console.log(`갑문 ${test.minutes}분 → ${result.totalFee.toLocaleString()}원`);

  if (result.totalFee !== test.expected) {
    throw new Error(`갑문 ${test.minutes}분 사용시간 계산 실패`);
  }
}

console.log("갑문 통과 예선 사용시간 계산 테스트 통과!");

const surchargeCases = [
  {
    name: "야간",
    options: { isNight: true },
    expected: 30000,
  },
  {
    name: "휴일",
    options: { isHoliday: true },
    expected: 30000,
  },
  {
    name: "야간+휴일",
    options: { isNight: true, isHoliday: true },
    expected: 30000,
  },
  {
    name: "야간+위험화물",
    options: { isNight: true, isDangerousCargo: true },
    expected: 60000,
  },
  {
    name: "야간+휴일+위험화물",
    options: {
      isNight: true,
      isHoliday: true,
      isDangerousCargo: true,
    },
    expected: 60000,
  },
];

for (const test of surchargeCases) {
  const result = calculateTugboatSurcharge({
    baseFee: 100000,
    ...test.options,
  });

  console.log(`${test.name} → ${result.totalSurcharge.toLocaleString()}원`);

  if (result.totalSurcharge !== test.expected) {
    throw new Error(`${test.name} 할증 계산 실패`);
  }
}

console.log("예선료 할증 계산 테스트 통과!");

const workFee = calculateTugboatWorkFee({
  port: "INCHEON",
  vesselType: "OCEAN",
  type: "BERTHING",
  totalHp: 5500,
  count: 2,
  minutes: 90,
  isNight: true,
});

console.log("\n=== 북항 야간 접안 예선료 ===");
console.log("기본요금:", workFee.totalBaseFee.toLocaleString());
console.log("시간요금:", workFee.timeFee.toLocaleString());
console.log("야간할증:", workFee.nightFee.toLocaleString());
console.log("최종요금:", workFee.totalFee.toLocaleString());

if (
  workFee.totalBaseFee !== 1740210 ||
  workFee.timeFee !== 2610315 ||
  workFee.nightFee !== 522063 ||
  workFee.totalFee !== 3132378
) {
  throw new Error("예선 작업 최종요금 테스트 실패");
}

console.log("예선 작업 최종요금 테스트 통과!");

const roundTripFee = calculateRoundTripTugboatFee({
  port: "INCHEON",
  grt: 20000,
  vesselType: "OCEAN",
  pilotageRoute: "PALMI_NORTH_PORT",

  arrival: {
    berthingMinutes: 90,
    isNight: true,
  },

  departure: {
    berthingMinutes: 60,
    isNight: false,
  },
});

console.log("\n=== 북항 왕복 최종 예선료 ===");
console.log("입항:", roundTripFee.arrivalTotal.toLocaleString(), "원");
console.log("출항:", roundTripFee.departureTotal.toLocaleString(), "원");
console.log("합계:", roundTripFee.totalTugboatFee.toLocaleString(), "원");

if (
  roundTripFee.arrivalTotal !== 3132378 ||
  roundTripFee.departureTotal !== 1740210 ||
  roundTripFee.totalTugboatFee !== 4872588
) {
  throw new Error("북항 왕복 최종 예선료 테스트 실패");
}

console.log("북항 왕복 최종 예선료 테스트 통과!");
