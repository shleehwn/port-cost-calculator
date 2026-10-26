/**
 * 항만시설 사용료 요율 데이터
 * 최신 시행 여부 및 단수 처리 규정은 추가 확인 필요
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
