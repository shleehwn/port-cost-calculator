import { useState } from "react";
import { calculatePortCost } from "./calculators/portCostCalculator";
import { formatDateTime, calculateBerthingHours } from "./utils/dateUtils";
import { PILOTAGE_RATES } from "./data/pilotageRates";
import { calculateRoundTripPilotage } from "./calculators/pilotageCalculator";
import { calculateRoundTripBerthingSurcharge } from "./calculators/pilotageCalculator";
import { calculateFinalRoundTripPilotage } from "./calculators/pilotageCalculator";
import { calculateRoundTripPilotBoatFee } from "./calculators/pilotBoatCalculator.js";
import { calculateRoundTripTugboatFee } from "./calculators/tugboatCalculator.js";

function App() {
  // 선박 정보 및 항비 입력값
  const [vessel, setVessel] = useState({
    vesselName: "",
    grt: "",
    nrt: "",
    dwt: "",
    loa: "",
    vesselType: "OCEAN", // 추가
    vesselCategory: "GENERAL", // 추가
    port: "INCHEON",
    eta: "",
    etb: "",
    etd: "",
    portCalls: "2",
    berthHours: "",

    // 도선료 계산용 신규 속성
    pilotageRoute: "",
    arrivalDraft: "",
    departureDraft: "",

    // 접안·이안 가산 적용 여부
    arrivalBerthing: true,
    departureUnberthing: true,

    // 야간·공휴일 할증 적용 여부
    arrivalNight: false,
    arrivalHoliday: false,
    departureNight: false,
    departureHoliday: false,
    arrivalDangerousCargo: false,
    departureDangerousCargo: false,

    pilotage: "",
    tugboat: "",
    // 예선 작업시간 (분)
    arrivalTugBerthingMinutes: "60",
    departureTugBerthingMinutes: "60",
    arrivalTugGateMinutes: "30",
    departureTugGateMinutes: "30",
  });

  // 계산 결과
  const [result, setResult] = useState(null);
  const [pilotageResult, setPilotageResult] = useState(null);
  const [berthingSurchargeResult, setBerthingSurchargeResult] = useState(null);
  const [finalPilotageResult, setFinalPilotageResult] = useState(null);
  const [pilotBoatResult, setPilotBoatResult] = useState(null);
  const [tugboatResult, setTugboatResult] = useState(null);

  // 결과 화면 탭
  const [activeTab, setActiveTab] = useState("PDA");

  // 입력값 공통 변경 함수
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : ["eta", "etb", "etd"].includes(name)
          ? formatDateTime(value)
          : value;

    setVessel((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "port" ? { pilotageRoute: "" } : {}),
    }));

    setResult(null);
    setPilotageResult(null);
    setBerthingSurchargeResult(null);
    setFinalPilotageResult(null); // 추가
    setPilotBoatResult(null);
    setTugboatResult(null);
  };

  const berthHours = calculateBerthingHours(vessel.etb, vessel.etd);
  // 접안시간을 시간과 분으로 표시
  const formatBerthingTime = (hours) => {
    if (hours === "" || !Number.isFinite(hours)) {
      return "";
    }

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h}시간 ${m}분`;
  };

  // 항비 계산
  const handleCalculate = () => {
    if (!vessel.vesselName.trim()) {
      alert("선박명을 입력해 주세요.");
      return;
    }

    if (!vessel.grt || Number(vessel.grt) <= 0) {
      alert("GT를 올바르게 입력해 주세요.");
      return;
    }

    if (berthHours === "" || berthHours <= 0) {
      alert("ETB와 ETD를 올바르게 입력해 주세요.");
      return;
    }

    try {
      const portCostResult = calculatePortCost({
        ...vessel,
        berthHours,
      });

      let newPilotageResult = null;
      let newBerthingSurchargeResult = null;
      let newFinalPilotageResult = null;

      if (vessel.pilotageRoute) {
        newPilotageResult = calculateRoundTripPilotage(vessel);
        newFinalPilotageResult = calculateFinalRoundTripPilotage(vessel);

        newBerthingSurchargeResult =
          calculateRoundTripBerthingSurcharge(vessel);
      }
      const boatResult = vessel.pilotageRoute
        ? calculateRoundTripPilotBoatFee(vessel)
        : null;

      // 예선료 자동 계산 (도선구간 선택 시)
      const tugResult =
        vessel.pilotageRoute && vessel.pilotageRoute !== "PALMI_ANCHORAGE"
          ? calculateRoundTripTugboatFee({
              port: vessel.port,
              grt: Number(vessel.grt),
              vesselType: vessel.vesselType,
              pilotageRoute: vessel.pilotageRoute,

              arrival: {
                berthingMinutes: Number(vessel.arrivalTugBerthingMinutes),
                gateMinutes: Number(vessel.arrivalTugGateMinutes),
                isNight: vessel.arrivalNight,
                isHoliday: vessel.arrivalHoliday,
                isDangerousCargo: vessel.arrivalDangerousCargo,
              },

              departure: {
                berthingMinutes: Number(vessel.departureTugBerthingMinutes),
                gateMinutes: Number(vessel.departureTugGateMinutes),
                isNight: vessel.departureNight,
                isHoliday: vessel.departureHoliday,
                isDangerousCargo: vessel.departureDangerousCargo,
              },
            })
          : null;

      setResult(portCostResult);
      setPilotageResult(newPilotageResult);
      setBerthingSurchargeResult(newBerthingSurchargeResult);
      setFinalPilotageResult(newFinalPilotageResult);
      setPilotBoatResult(boatResult);
      setTugboatResult(tugResult);
      setActiveTab("PDA");
    } catch (error) {
      alert(error.message);
      setResult(null);
      setPilotageResult(null);
      setBerthingSurchargeResult(null);
      setFinalPilotageResult(null);
      setPilotBoatResult(null);
      setTugboatResult(null);
    }
  };

  // 금액 표시 함수
  const formatKRW = (amount) => {
    return `₩ ${Math.trunc(amount).toLocaleString("ko-KR")}`;
  };
  // 최종 도선료 (자동 계산 우선, 미선택 시 수동 입력값 사용)
  const totalPilotageFee = finalPilotageResult
    ? finalPilotageResult.totalFinalPilotageFee
    : Number(result?.pilotage || 0);

  // 최종 도선선료
  const totalPilotBoatFee = pilotBoatResult
    ? pilotBoatResult.totalPilotBoatFee
    : 0;

  // 최종 예선료 (자동 계산 우선, 미선택 시 수동 입력값 사용)
  const totalTugboatFee =
    vessel.pilotageRoute === "PALMI_ANCHORAGE"
      ? 0
      : tugboatResult
        ? tugboatResult.totalTugboatFee
        : Number(result?.tugboat || 0);

  // 기존 합계에서 수동 도선료를 제외하고 자동 계산 결과 반영
  const totalEstimatedCost = result
    ? result.total -
      Number(result.pilotage || 0) -
      Number(result.tugboat || 0) +
      totalPilotageFee +
      totalPilotBoatFee +
      totalTugboatFee
    : 0;
  return (
    <div className="min-h-screen bg-slate-100 px-2 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full min-w-0 max-w-4xl rounded-xl bg-white p-3 shadow-lg sm:p-6">
        {/* 제목 */}
        <h1 className="mb-2 text-2xl font-bold text-blue-900">
          Port Cost Calculator
        </h1>
        <p className="mb-8 text-gray-500">선박 예상항비 계산 시스템</p>

        {/* 선박 기본 정보 */}
        <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
          1. Vessel Information
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">Vessel Name</label>
            <input
              type="text"
              name="vesselName"
              value={vessel.vesselName}
              onChange={handleChange}
              placeholder="MV OCEAN"
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Vessel Type</label>

            <select
              name="vesselType"
              value={vessel.vesselType}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="OCEAN">Ocean-going Vessel (외항선)</option>
              <option value="COASTAL">Coastal Vessel (내항선)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">
              Vessel Category (선박 용도)
            </label>

            <select
              name="vesselCategory"
              value={vessel.vesselCategory}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="GENERAL">General / Cargo / Tanker</option>
              <option value="HARBOR">Harbor Operating Vessel</option>
              <option value="PASSENGER">Coastal Passenger Vessel</option>
            </select>
          </div>
          {[
            ["grt", "GT (Gross Tonnage)"],
            ["nrt", "NT (Net Tonnage)"],
            ["dwt", "DWT (Deadweight)"],
            ["loa", "LOA (Length Overall, m)"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="mb-1 block font-medium">{label}</label>
              <input
                type="number"
                min="0"
                name={name}
                value={vessel[name]}
                onChange={handleChange}
                placeholder={`Enter ${name.toUpperCase()}`}
                className="w-full rounded border p-3"
              />
            </div>
          ))}
        </div>

        {/* 항만 작업 정보 */}
        <h2 className="mb-4 mt-8 border-b pb-2 text-lg font-bold text-gray-800">
          2. Port Operation & Charges
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">Port</label>
            <select
              name="port"
              value={vessel.port}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="INCHEON">Incheon</option>
              <option value="PYEONGTAEK">Pyeongtaek</option>
              <option value="DANGJIN">Dangjin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">
              Pilotage Route (도선 구간)
            </label>

            <select
              name="pilotageRoute"
              value={vessel.pilotageRoute}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="">Select Pilotage Route</option>

              {Object.entries(PILOTAGE_RATES[vessel.port]?.routes || {})
                .filter(([routeCode]) => routeCode !== "INNER_MOVEMENT")
                .map(([routeCode, routeInfo]) => (
                  <option key={routeCode} value={routeCode}>
                    {routeInfo.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">
              ETA (Estimated Time of Arrival)
            </label>
            <input
              type="text"
              name="eta"
              value={vessel.eta}
              onChange={handleChange}
              placeholder="YYYY-MM-DD HH:mm"
              maxLength={16}
              inputMode="numeric"
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">
              ETB (Estimated Time of Berthing)
            </label>
            <input
              type="text"
              name="etb"
              value={vessel.etb}
              onChange={handleChange}
              placeholder="YYYY-MM-DD HH:mm"
              maxLength={16}
              inputMode="numeric"
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">
              ETD (Estimated Time of Departure)
            </label>
            <input
              type="text"
              name="etd"
              value={vessel.etd}
              onChange={handleChange}
              placeholder="YYYY-MM-DD HH:mm"
              maxLength={16}
              inputMode="numeric"
              className="w-full rounded border p-3"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Port Calls</label>
            <select
              name="portCalls"
              value={vessel.portCalls}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="2">Inbound + Outbound</option>
              <option value="1">Inbound Only</option>
              <option value="0">Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Berthing Hours(Auto Calculated)
            </label>
            <input
              type="text"
              value={formatBerthingTime(berthHours)}
              readOnly
              className="w-full rounded border bg-gray-100 p-3"
            />
          </div>
        </div>

        {/* 도선료 세부 옵션 */}
        <details className="mt-6 rounded-lg border border-gray-300 bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold text-blue-900">
            Pilotage Options (도선료 세부 조건)
          </summary>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">
                Arrival Draft (입항 흘수 / m)
              </label>
              <input
                type="number"
                name="arrivalDraft"
                value={vessel.arrivalDraft}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="예: 10.5"
                className="w-full rounded border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">
                Departure Draft (출항 흘수 / m)
              </label>
              <input
                type="number"
                name="departureDraft"
                value={vessel.departureDraft}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="예: 6.2"
                className="w-full rounded border p-3"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded border p-3">
                <input
                  type="checkbox"
                  name="arrivalBerthing"
                  checked={vessel.arrivalBerthing}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <span>Arrival Berthing (입항 접안)</span>
              </label>

              <label className="flex items-center gap-3 rounded border p-3">
                <input
                  type="checkbox"
                  name="departureUnberthing"
                  checked={vessel.departureUnberthing}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <span>Departure Unberthing (출항 이안)</span>
              </label>
            </div>
            {/* 야간·공휴일 할증 조건 */}
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              {/* 입항 조건 */}
              <div className="rounded border p-3">
                <p className="mb-3 font-medium">Arrival (입항)</p>

                <label className="mb-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="arrivalNight"
                    checked={vessel.arrivalNight}
                    onChange={handleChange}
                  />
                  Night Pilotage (야간)
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="arrivalHoliday"
                    checked={vessel.arrivalHoliday}
                    onChange={handleChange}
                  />
                  Holiday Pilotage (공휴일)
                </label>
              </div>

              {/* 출항 조건 */}
              <div className="rounded border p-3">
                <p className="mb-3 font-medium">Departure (출항)</p>

                <label className="mb-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="departureNight"
                    checked={vessel.departureNight}
                    onChange={handleChange}
                  />
                  Night Pilotage (야간)
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="departureHoliday"
                    checked={vessel.departureHoliday}
                    onChange={handleChange}
                  />
                  Holiday Pilotage (공휴일)
                </label>
              </div>
            </div>
            {/* 위험물 할증 적용 여부 */}
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded border p-3">
                <input
                  type="checkbox"
                  name="arrivalDangerousCargo"
                  checked={vessel.arrivalDangerousCargo}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <span>Arrival Dangerous Cargo (입항 위험물)</span>
              </label>

              <label className="flex items-center gap-3 rounded border p-3">
                <input
                  type="checkbox"
                  name="departureDangerousCargo"
                  checked={vessel.departureDangerousCargo}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <span>Departure Dangerous Cargo (출항 위험물)</span>
              </label>
            </div>
          </div>
        </details>

        {/* 예선 작업시간 입력 */}
        <details className="mt-6 rounded-lg border border-gray-300 bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold text-blue-900">
            Tugboat Options (예선 작업시간)
          </summary>

          <div className="mt-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium">
                  Arrival Berthing Time (입항 접안 / 분)
                </label>
                <input
                  type="number"
                  name="arrivalTugBerthingMinutes"
                  value={vessel.arrivalTugBerthingMinutes}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full rounded border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Departure Unberthing Time (출항 이안 / 분)
                </label>
                <input
                  type="number"
                  name="departureTugBerthingMinutes"
                  value={vessel.departureTugBerthingMinutes}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full rounded border p-3"
                />
              </div>

              {vessel.pilotageRoute === "PALMI_INNER_HARBOR" && (
                <>
                  <div>
                    <label className="mb-1 block font-medium">
                      Arrival Gate Time (입항 갑문 / 분)
                    </label>
                    <input
                      type="number"
                      name="arrivalTugGateMinutes"
                      value={vessel.arrivalTugGateMinutes}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      className="w-full rounded border p-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium">
                      Departure Gate Time (출항 갑문 / 분)
                    </label>
                    <input
                      type="number"
                      name="departureTugGateMinutes"
                      value={vessel.departureTugGateMinutes}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      className="w-full rounded border p-3"
                    />
                  </div>
                </>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500">
              ※ 예선 사용시간은 예상 작업시간입니다. 실제 배정 및 사용시간에
              따라 최종 예선료가 달라질 수 있습니다.
            </p>
          </div>
        </details>

        {/* 수동 요금 입력 (자동 계산 불가 시 보조 입력) */}
        <details className="mt-6 rounded-lg border border-gray-300 bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold text-blue-900">
            Manual Charges (수동 요금 입력)
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">
                Pilotage Fee (KRW)
              </label>
              <input
                type="number"
                min="0"
                name="pilotage"
                value={vessel.pilotage}
                onChange={handleChange}
                placeholder="도선료 직접 입력"
                className="w-full rounded border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">
                Tugboat Fee (KRW)
              </label>
              <input
                type="number"
                min="0"
                name="tugboat"
                value={vessel.tugboat}
                onChange={handleChange}
                placeholder="예선료 직접 입력"
                className="w-full rounded border p-3"
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            ※ 도선구간을 선택하여 자동 계산한 경우 해당 자동 계산 금액이 우선
            적용됩니다.
          </p>
        </details>

        {/* 계산 버튼 */}
        <button
          type="button"
          onClick={handleCalculate}
          className="mt-8 w-full rounded-lg bg-blue-900 p-3 font-bold text-white hover:bg-blue-800"
        >
          Calculate Port Charges
        </button>

        {/* 계산 결과 탭 메뉴 */}
        {result && (
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { id: "PDA", label: "PDA Summary" },
              { id: "PILOTAGE", label: "Pilotage" },
              { id: "PILOT_BOAT", label: "Pilot Boat" },
              { id: "TUGBOAT", label: "Tugboat" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 계산 결과 */}
        {result && activeTab === "PDA" && (
          <div className="mt-8 rounded-lg bg-slate-50 p-5">
            <h2 className="mb-4 text-xl font-bold text-blue-900">
              3. Estimated Port Charges
            </h2>
            {/* 입출항료 */}
            <div className="flex justify-between border-b py-3">
              <span>Port Dues (입출항료)</span>
              <span className="font-medium">{formatKRW(result.portDues)}</span>
            </div>

            {/* 접안료 합계 */}
            <div className="flex justify-between pt-3 pb-2">
              <span className="font-medium">Berth Dues (접안료)</span>
              <span className="font-medium">{formatKRW(result.berthDues)}</span>
            </div>

            {/* 접안료 상세 내역 */}
            <div className="border-b pb-3 pl-4 text-sm text-gray-500">
              {result.berthType === "STANDARD" ? (
                <>
                  <div className="flex justify-between py-1">
                    <span>└ Basic Dues (기본료 / 최초 12시간)</span>
                    <span>{formatKRW(result.basicDues)}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span>└ Extra Dues (초과료 / {result.extraHours}시간)</span>
                    <span>{formatKRW(result.extraDues)}</span>
                  </div>
                </>
              ) : (
                <p className="py-2 text-amber-700">
                  ※ 기타 선박 접안료가 적용되었습니다. (50GT 기준, 1개월 이하
                  사용 가정)
                </p>
              )}
            </div>

            {/* 도선료 */}
            <div className="flex justify-between border-b py-3">
              <span>Pilotage (도선료)</span>
              <span className="font-medium">{formatKRW(totalPilotageFee)}</span>
            </div>

            {/* 도선선료 */}
            <div className="flex justify-between border-b py-3">
              <span>Pilot Boat Fee (도선선료)</span>
              <span className="font-medium">
                {formatKRW(totalPilotBoatFee)}
              </span>
            </div>

            {/* 예선료 */}
            <div className="flex justify-between border-b py-3">
              <span>Tugboat (예선료)</span>
              <span className="font-medium">{formatKRW(totalTugboatFee)}</span>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2 text-xl font-bold">
              <span>Total Estimated Cost</span>
              <span className="text-blue-900">
                {formatKRW(totalEstimatedCost)}
              </span>
            </div>

            <p className="mt-5 text-xs text-gray-500">
              ※ 제공된 항만시설 사용료 요율표를 기준으로 계산한 예상 금액입니다.
            </p>
          </div>
        )}
        {pilotageResult && activeTab === "PILOTAGE" && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-4 text-lg font-bold">
              Pilotage Calculation (도선료 기본 산식)
            </h3>

            <div className="space-y-2">
              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Arrival Pilotage (입항 도선료)</span>
                <span className="shrink-0 text-right"></span>
                <span>{formatKRW(pilotageResult.arrival.pilotageFee)}</span>
              </div>

              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Departure Pilotage (출항 도선료)</span>
                <span className="shrink-0 text-right"></span>
                <span>{formatKRW(pilotageResult.departure.pilotageFee)}</span>
              </div>

              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Round Trip Pilotage (왕복 소계)</span>
                <span className="shrink-0 text-right"></span>
                <span>{formatKRW(pilotageResult.totalPilotageFee)}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              ※ 기본 도선료와 최저 도선료를 적용한 계산 결과입니다. 접·이안 및
              기타 할증은 아래 최종 도선료 계산에 반영됩니다.
            </p>
          </div>
        )}
        {berthingSurchargeResult && activeTab === "PILOTAGE" && (
          <div className="mt-4 rounded-lg border p-5">
            <h3 className="mb-4 text-lg font-bold">
              Berthing / Unberthing Surcharge (접·이안 가산료)
            </h3>

            <div className="space-y-2">
              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Arrival Berthing (입항 접안)</span>
                <span className="shrink-0 text-right"></span>
                <span>
                  {formatKRW(berthingSurchargeResult.arrival.surcharge)}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Departure Unberthing (출항 이안)</span>
                <span className="shrink-0 text-right"></span>
                <span>
                  {formatKRW(berthingSurchargeResult.departure.surcharge)}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Total Surcharge (가산료 합계)</span>
                <span className="shrink-0 text-right"></span>
                <span>{formatKRW(berthingSurchargeResult.totalSurcharge)}</span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              ※ 접·이안 가산료는 최종 도선료에 포함되어 있으며, 별도로 중복
              합산하지 않습니다.
            </p>
          </div>
        )}
        {finalPilotageResult && activeTab === "PILOTAGE" && (
          <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 p-5">
            <h3 className="mb-4 text-lg font-bold">
              Pilotage Charges Summary (도선료 계산 요약)
            </h3>

            <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Arrival Pilotage (입항)</span>
              <span className="shrink-0 text-right"></span>
              <span>{formatKRW(finalPilotageResult.arrival.finalFee)}</span>
            </div>

            <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Departure Pilotage (출항)</span>
              <span className="shrink-0 text-right"></span>
              <span>{formatKRW(finalPilotageResult.departure.finalFee)}</span>
            </div>
            {/* 야간·공휴일 할증 내역 */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Arrival Time Surcharge (입항 시간 할증)</span>
                <span className="shrink-0 text-right"></span>
                <span>
                  {formatKRW(finalPilotageResult.arrivalTime.surcharge)}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Departure Time Surcharge (출항 시간 할증)</span>
                <span className="shrink-0 text-right"></span>
                <span>
                  {formatKRW(finalPilotageResult.departureTime.surcharge)}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Arrival Dangerous Cargo Surcharge (입항 위험물 할증)</span>
              <span className="shrink-0 text-right"></span>
              <span>
                {formatKRW(finalPilotageResult.arrivalDangerous.surcharge)}
              </span>
            </div>

            <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Departure Dangerous Cargo Surcharge (출항 위험물 할증)
              </span>
              <span className="shrink-0 text-right"></span>
              <span>
                {formatKRW(finalPilotageResult.departureDangerous.surcharge)}
              </span>
            </div>

            <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Round Trip Total (왕복 합계)</span>
              <span className="shrink-0 text-right"></span>
              <span>
                {formatKRW(finalPilotageResult.totalFinalPilotageFee)}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              ※ 기본 도선료, 접·이안 가산료 및 각종 할증을 반영한 최종
              도선료입니다. 최종 예상항비에 포함되어 있습니다.
            </p>
          </div>
        )}
        {pilotBoatResult && activeTab === "PILOT_BOAT" && (
          <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-6">
            <h3 className="text-xl font-bold mb-4">
              Pilot Boat Charges Summary (도선선료 계산 결과)
            </h3>

            <div className="flex justify-between py-2">
              <span>Arrival Base Fee (입항 기본 도선선료)</span>
              <span>{formatKRW(pilotBoatResult.arrival.baseFee)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>Arrival Surcharge (입항 시간 할증)</span>
              <span>{formatKRW(pilotBoatResult.arrival.surcharge)}</span>
            </div>
            {pilotBoatResult.arrival.carServiceFee > 0 && (
              <div className="flex justify-between py-2">
                <span>Arrival CAR SERVICE (입항 차량 서비스료)</span>
                <span>{formatKRW(pilotBoatResult.arrival.carServiceFee)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-semibold">
              <span>Arrival Total (입항 도선선료)</span>
              <span>{formatKRW(pilotBoatResult.arrival.finalFee)}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between py-2">
              <span>Departure Base Fee (출항 기본 도선선료)</span>
              <span>{formatKRW(pilotBoatResult.departure.baseFee)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>Departure Surcharge (출항 시간 할증)</span>
              <span>{formatKRW(pilotBoatResult.departure.surcharge)}</span>
            </div>
            {pilotBoatResult.departure.carServiceFee > 0 && (
              <div className="flex justify-between py-2">
                <span>Departure CAR SERVICE (출항 차량 서비스료)</span>
                <span>
                  {formatKRW(pilotBoatResult.departure.carServiceFee)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 font-semibold">
              <span>Departure Total (출항 도선선료)</span>
              <span>{formatKRW(pilotBoatResult.departure.finalFee)}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Round Trip Pilot Boat Fee (왕복 도선선료)</span>
              <span>{formatKRW(pilotBoatResult.totalPilotBoatFee)}</span>
            </div>
          </div>
        )}
        {/* 예선료 상세 계산 결과 */}
        {tugboatResult && activeTab === "TUGBOAT" && (
          <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-6">
            <h3 className="mb-4 text-xl font-bold">
              Tugboat Charges Summary (예선료 계산 결과)
            </h3>

            {[
              ["Arrival (입항)", tugboatResult.arrival],
              ["Departure (출항)", tugboatResult.departure],
            ].map(([label, works]) => (
              <div key={label} className="mb-5">
                <h4 className="mb-3 border-b pb-2 font-semibold">{label}</h4>

                {works.map((work, index) => (
                  <div
                    key={`${work.type}-${index}`}
                    className="mb-4 rounded bg-white p-4"
                  >
                    <div className="mb-2 font-medium">
                      {work.type === "GATE"
                        ? "Gate (갑문)"
                        : work.type === "BERTHING"
                          ? "Berthing (접안)"
                          : "Unberthing (이안)"}
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Required Horsepower (기준 마력)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{work.requiredTotalHp.toLocaleString()} HP</span>
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Tugboats (예선 척수)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{work.requiredCount}척</span>
                    </div>
                    {/* 예선별 추정 마력 및 기본요금 */}
                    <div className="my-3 rounded border bg-slate-50 p-3">
                      <p className="mb-2 text-sm font-semibold text-gray-700">
                        Estimated Tugboat Allocation (예선별 추정 배분)
                      </p>

                      {work.tugboats.map((tugboat) => (
                        <div
                          key={tugboat.tugboatNo}
                          className="flex justify-between gap-3 py-1 text-sm text-gray-600"
                        >
                          <span>
                            Tugboat {tugboat.tugboatNo} —{" "}
                            {tugboat.horsepower.toLocaleString()} HP
                          </span>

                          <span>{formatKRW(tugboat.baseFee)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Operation Time (사용시간)</span>
                      <span className="shrink-0 text-right">
                        {work.minutes}분
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Base Fee (기본요금 합계)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{formatKRW(work.totalBaseFee)}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Time Applied Fee (시간 적용 요금)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{formatKRW(work.timeFee)}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Surcharge (할증료)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{formatKRW(work.totalSurcharge)}</span>
                    </div>

                    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Work Total (작업별 합계)</span>
                      <span className="shrink-0 text-right"></span>
                      <span>{formatKRW(work.totalFee)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex justify-between border-t pt-4 text-lg font-bold">
              <span>Round Trip Tugboat Fee (왕복 예선료)</span>
              <span>{formatKRW(tugboatResult.totalTugboatFee)}</span>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              ※ GT별 예선 사용 기준과 추정 마력 배분을 적용한 예상 금액입니다.
              실제 예선 배정 및 사용시간에 따라 최종 요금은 달라질 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
