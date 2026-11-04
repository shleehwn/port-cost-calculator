import {
  getEstimatedTugboatStandard,
  getTugboatWorkStandards,
} from "./tugboatStandardsCalculator.js";

const testCases = [
  { gt: 5000, gate: "gate10k", hp: 2800, count: 2 },
  { gt: 9999, gate: "gate10k", hp: 4800, count: 2 },
  { gt: 10000, gate: "gate50k", hp: 6000, count: 3 },
  { gt: 20000, gate: "gate50k", hp: 8000, count: 3 },
];

for (const test of testCases) {
  const result = getEstimatedTugboatStandard("INCHEON", test.gt);

  console.log(`GT ${test.gt}`);
  console.log("예상 갑문:", result.gate);
  console.log("입항 총마력:", result.gateArrival?.hp);
  console.log("입항 척수:", result.gateArrival?.count);
  console.log("------------------------");

  if (
    result.gate !== test.gate ||
    result.gateArrival?.hp !== test.hp ||
    result.gateArrival?.count !== test.count
  ) {
    throw new Error(`GT ${test.gt} 예선 기준 테스트 실패`);
  }
}

console.log("모든 예선 사용 기준 테스트 통과!");

const inner = getTugboatWorkStandards("INCHEON", 20000, "PALMI_INNER_HARBOR");

console.log("=== 내항 예선 작업 ===");

console.log(inner);

if (
  inner.arrival.length !== 2 ||
  inner.arrival[0].hp !== 8000 ||
  inner.arrival[1].hp !== 5500 ||
  inner.departure[1].hp !== 7000
) {
  throw new Error("내항 예선 작업 기준 테스트 실패");
}

const north = getTugboatWorkStandards("INCHEON", 20000, "PALMI_NORTH_PORT");

console.log("=== 북항 예선 작업 ===");
console.log(north);

if (
  north.arrival.length !== 1 ||
  north.arrival[0].hp !== 5500 ||
  north.departure[0].count !== 2
) {
  throw new Error("북항 예선 작업 기준 테스트 실패");
}

console.log("내항·외항 예선 작업 기준 테스트 통과!");
