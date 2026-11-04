/**
 * 인천항 예선 사용 기준표
 *
 * 출처: 인천지방해양수산청
 * 단위: GT(총톤수), HP(총마력), 척수
 *
 * minGt 이상, maxGt 미만
 * maxGt: null이면 상한 없음
 *
 * gate10k: 1만 톤 GATE
 * gate50k: 5만 톤 GATE
 * innerBerthing: 선거 내 접·이안
 * outerBerthing: 외항 접·이안
 *
 * 각 항목: { hp: 총마력, count: 척수 }
 * 기준표에 없는 항목은 null
 */

export const TUGBOAT_STANDARDS = {
  INCHEON: [
    {
      minGt: 1000,
      maxGt: 2000,
      gate10k: {
        arrival: { hp: 1300, count: 1 },
        departure: { hp: 1300, count: 1 },
      },
      gate50k: {
        arrival: { hp: 1300, count: 1 },
        departure: { hp: 1300, count: 1 },
      },
      innerBerthing: { hp: 1300, count: 1 },
      outerBerthing: { hp: 1300, count: 1 },
    },
    {
      minGt: 2000,
      maxGt: 3000,
      gate10k: {
        arrival: { hp: 1500, count: 1 },
        departure: { hp: 1500, count: 1 },
      },
      gate50k: {
        arrival: { hp: 1300, count: 1 },
        departure: { hp: 1300, count: 1 },
      },
      innerBerthing: { hp: 1300, count: 1 },
      outerBerthing: { hp: 1300, count: 1 },
    },
    {
      minGt: 3000,
      maxGt: 5000,
      gate10k: {
        arrival: { hp: 2600, count: 2 },
        departure: { hp: 2600, count: 2 },
      },
      gate50k: {
        arrival: { hp: 2600, count: 2 },
        departure: { hp: 2600, count: 2 },
      },
      innerBerthing: { hp: 2600, count: 2 },
      outerBerthing: { hp: 2600, count: 2 },
    },
    {
      minGt: 5000,
      maxGt: 7000,
      gate10k: {
        arrival: { hp: 2800, count: 2 },
        departure: { hp: 2800, count: 2 },
      },
      gate50k: {
        arrival: { hp: 2800, count: 2 },
        departure: { hp: 2800, count: 2 },
      },
      innerBerthing: { hp: 2800, count: 2 },
      outerBerthing: { hp: 2800, count: 2 },
    },
    {
      minGt: 7000,
      maxGt: 10000,
      gate10k: {
        arrival: { hp: 4800, count: 2 },
        departure: { hp: 3000, count: 2 },
      },
      gate50k: {
        arrival: { hp: 4800, count: 2 },
        departure: { hp: 3000, count: 2 },
      },
      innerBerthing: { hp: 3000, count: 2 },
      outerBerthing: { hp: 3000, count: 2 },
    },
    {
      minGt: 10000,
      maxGt: 15000,
      gate10k: null,
      gate50k: {
        arrival: { hp: 6000, count: 3 },
        departure: { hp: 5000, count: 3 },
      },
      innerBerthing: { hp: 3500, count: 2 },
      outerBerthing: { hp: 3500, count: 2 },
    },
    {
      minGt: 15000,
      maxGt: 20000,
      gate10k: null,
      gate50k: {
        arrival: { hp: 7000, count: 3 },
        departure: { hp: 5500, count: 3 },
      },
      innerBerthing: { hp: 4500, count: 2 },
      outerBerthing: { hp: 5000, count: 2 },
    },
    {
      minGt: 20000,
      maxGt: 30000,
      gate10k: null,
      gate50k: {
        arrival: { hp: 8000, count: 3 },
        departure: { hp: 7000, count: 3 },
      },
      innerBerthing: { hp: 5500, count: 2 },
      outerBerthing: { hp: 5500, count: 2 },
    },
    {
      minGt: 30000,
      maxGt: 50000,
      gate10k: null,
      gate50k: {
        arrival: { hp: 9000, count: 3 },
        departure: { hp: 7500, count: 3 },
      },
      innerBerthing: { hp: 5500, count: 2 },
      outerBerthing: { hp: 6500, count: 2 },
    },
    {
      minGt: 50000,
      maxGt: 70000,
      gate10k: null,
      gate50k: {
        arrival: { hp: 9900, count: 3 },
        departure: { hp: 8400, count: 3 },
      },
      innerBerthing: { hp: 6000, count: 2 },
      outerBerthing: {
        hpMin: 10000,
        hpMax: 13000,
        count: 3,
      },
    },
    {
      minGt: 70000,
      maxGt: 100000,
      gate10k: null,
      gate50k: null,
      innerBerthing: null,
      outerBerthing: {
        hpMin: 16000,
        hpMax: 20000,
        count: 4,
      },
    },
    {
      minGt: 100000,
      maxGt: 135000,
      gate10k: null,
      gate50k: null,
      innerBerthing: null,
      outerBerthing: {
        hpMin: 20000,
        hpMax: 24000,
        countMin: 4,
        countMax: 5,
      },
    },
    {
      minGt: 135000,
      maxGt: null,
      gate10k: null,
      gate50k: null,
      innerBerthing: null,
      outerBerthing: {
        hpMin: 22000,
        hpMax: 25000,
        count: 5,
      },
    },
  ],
};
