/**
 * Pilotage Rates
 *
 * 한국도선사협회 도선료 신고사항 기준
 *
 * 주의:
 * - 도선 구간별 기본료는 공식 요율표 확인 후 입력
 * - GT 및 Draft 초과료, 할증료는 별도 계산
 */

export const PILOTAGE_RATES = {
  INCHEON: {
    portName: "Incheon Port",

    routes: {
      PALMI_ANCHORAGE: {
        name: "팔미도선점 ↔ 인천항 정박지",
        baseRate: 100450,
      },

      PALMI_INNER_HARBOR: {
        name: "팔미도선점 ↔ 인천항 선거내",
        baseRate: 172570,
      },

      PALMI_NORTH_PORT: {
        name: "팔미도선점 ↔ 인천 북항",
        baseRate: 163940,
      },

      PALMI_SOUTH_PORT: {
        name: "팔미도선점 ↔ 남항·연안부두",
        baseRate: 137670,
      },

      INNER_MOVEMENT: {
        name: "인천항내 이동 (선거외)",
        baseRate: 97800,
      },

      NEW_PORT: {
        name: "인천신항도선점 ↔ 인천신항",
        baseRate: 178970,
      },
    },
  },
  PYEONGTAEK: {
    portName: "Pyeongtaek Port",

    routes: {
      // 도선 구간별 요율 등록 예정
    },
  },

  DANGJIN: {
    portName: "Dangjin Port",

    routes: {
      // 평택·당진 도선구의 적용 구간 확인 후 등록
    },
  },
};
