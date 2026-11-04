import { PILOT_BOAT_RATES } from "../data/pilotBoatRates.js";
import { PILOT_BOAT_ROUTE_MAPPING } from "../data/pilotBoatRouteMapping.js";

// 편도 도선선료 계산
export function calculatePilotBoatFee({
  port,
  route,
  isNight = false,
  isHoliday = false,
}) {
  const portRates = PILOT_BOAT_RATES[port];

  if (!portRates) {
    throw new Error("지원하지 않는 항만입니다.");
  }
  const boatRoutes = PILOT_BOAT_ROUTE_MAPPING[port]?.[route];

  if (!boatRoutes) {
    throw new Error("도선선료 매핑이 없는 도선구간입니다.");
  }

  const baseFee = boatRoutes.reduce((sum, boatRoute) => {
    const fee = portRates.routes[boatRoute];

    if (fee === undefined) {
      throw new Error(`도선선료 요율이 없습니다: ${boatRoute}`);
    }

    return sum + fee;
  }, 0);
  // 야간·공휴일 중복 시 야간 50%만 적용 (임시 가정)
  const surchargeRate = isNight
    ? portRates.surcharges.night
    : isHoliday
      ? portRates.surcharges.holiday
      : 0;

  const surcharge = Math.trunc(baseFee * surchargeRate);

  // 내항인 경우 CAR SERVICE 추가
  const carServiceFee =
    route === "PALMI_INNER_HARBOR" ? portRates.carService.innerHarbor : 0;

  // 최종 도선선료
  const finalFee = baseFee + surcharge + carServiceFee;

  return {
    baseFee,
    surchargeRate,
    surcharge,
    carServiceFee,
    finalFee,
  };
}

// 입항 + 출항 도선선료 계산
export function calculateRoundTripPilotBoatFee(vessel) {
  const arrival = calculatePilotBoatFee({
    port: vessel.port,
    route: vessel.pilotageRoute,
    isNight: vessel.arrivalNight,
    isHoliday: vessel.arrivalHoliday,
  });

  const departure = calculatePilotBoatFee({
    port: vessel.port,
    route: vessel.pilotageRoute,
    isNight: vessel.departureNight,
    isHoliday: vessel.departureHoliday,
  });

  return {
    arrival,
    departure,
    totalPilotBoatFee: arrival.finalFee + departure.finalFee,
  };
}
