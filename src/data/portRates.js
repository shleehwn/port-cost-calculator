/**
 * 항만시설 사용료 요율 데이터.인천항 기준 작성
 */

export const PORT_RATES = {
  INCHEON: {
    portDuesPerGt: 135,

    // 일반 선박 접안료 (10GT 단위)
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

    // 기타 선박 접안료 (50GT 이하, 1척·1월 이하 기준)
    otherBerthDues: {
      GENERAL: 3691,
      HARBOR: 6781,
      PASSENGER: 3913,
    },
  },
};
