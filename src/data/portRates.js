/**
 * 항만시설 사용료 요율 데이터.인천항 기준 작성
 */

export const PORT_RATES = {
  INCHEON: {
    portDuesPerGt: 135,

    berthDues: {
      OCEAN: {
        basicRate: 358,
        extraRate: 29.9,
      },
      COASTAL: {
        basicRate: 120,
        extraRate: 10,
      },
    },
  },
};
