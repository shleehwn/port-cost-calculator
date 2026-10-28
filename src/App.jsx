import { useState } from "react";
import { calculatePortCost } from "./calculators/portCostCalculator";
import { formatDateTime, calculateBerthingHours } from "./utils/dateUtils";

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
    pilotage: "",
    tugboat: "",
  });

  // 계산 결과
  const [result, setResult] = useState(null);

  // 입력값 공통 변경 함수
  const handleChange = (e) => {
    const { name, value } = e.target;

    const newValue = ["eta", "etb", "etd"].includes(name)
      ? formatDateTime(value)
      : value;

    setVessel((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setResult(null);
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
      const calculated = calculatePortCost({
        ...vessel,
        berthHours,
      });

      setResult(calculated);
    } catch (error) {
      alert(error.message);
      setResult(null);
    }
  };

  // 금액 표시 함수
  const formatKRW = (amount) => {
    return `₩ ${Math.trunc(amount).toLocaleString("ko-KR")}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg">
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
        </div>

        {/* 항만 작업 및 수동 항비 */}
        <div className="mt-8">
          <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
            2. Port Operation & Charges
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
        </div>

        {/* 계산 버튼 */}
        <button
          type="button"
          onClick={handleCalculate}
          className="mt-8 w-full rounded-lg bg-blue-900 p-3 font-bold text-white hover:bg-blue-800"
        >
          Calculate Port Charges
        </button>

        {/* 계산 결과 */}
        {result && (
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
              <span className="font-medium">{formatKRW(result.pilotage)}</span>
            </div>

            {/* 예선료 */}
            <div className="flex justify-between border-b py-3">
              <span>Tugboat (예선료)</span>
              <span className="font-medium">{formatKRW(result.tugboat)}</span>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2 text-xl font-bold">
              <span>Total Estimated Cost</span>
              <span className="text-blue-900">{formatKRW(result.total)}</span>
            </div>

            <p className="mt-5 text-xs text-gray-500">
              ※ 제공된 항만시설 사용료 요율표를 기준으로 계산한 예상 금액입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
