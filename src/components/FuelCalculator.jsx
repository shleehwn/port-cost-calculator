import { useState } from "react";
import { calculateFuelCostByOperation } from "../calculators/fuelConsumptionCalculator";
import { getBulkCarrierFuelProfile } from "../data/vesselFuelProfiles";

const fuelRateFields = [
  ["seaVlsfoDaily", "Sea VLSFO"],
  ["seaMgoDaily", "Sea MGO"],
  ["idleVlsfoDaily", "Idle VLSFO"],
  ["idleMgoDaily", "Idle MGO"],
  ["workingVlsfoDaily", "Working VLSFO"],
  ["workingMgoDaily", "Working MGO"],
];

const numberFormat = (value, digits = 2) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function FuelCalculator() {
  const [form, setForm] = useState({
    dwt: "58000",
    distanceNm: "2500",
    speedKnots: "12.5",
    seaMargin: "5",
    idleDays: "0",
    workingDays: "0",
    vlsfoPrice: "600",
    mgoPrice: "800",

    // 빈 값이면 선형별 자동 소비량 적용
    seaVlsfoDaily: "",
    seaMgoDaily: "",
    idleVlsfoDaily: "",
    idleMgoDaily: "",
    workingVlsfoDaily: "",
    workingMgoDaily: "",
  });

  const [result, setResult] = useState(null);

  const profile = getBulkCarrierFuelProfile(form.dwt);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setResult(null);
  };

  // 자동 소비량을 계산 엔진에서 가져옴
  const getAutomaticRates = () => {
    if (!profile || Number(form.speedKnots) <= 0) {
      return null;
    }

    const speed = Number(form.speedKnots);

    return {
      seaVlsfoDaily:
        profile.mainEngineDaily * Math.pow(speed / profile.referenceSpeed, 3),
      ...profile.fuelRates,
    };
  };

  const automaticRates = getAutomaticRates();

  const handleCalculate = () => {
    try {
      const params = {
        dwt: form.dwt,
        distanceNm: form.distanceNm,
        speedKnots: form.speedKnots,
        seaMargin: form.seaMargin,
        idleDays: form.idleDays,
        workingDays: form.workingDays,
        vlsfoPrice: form.vlsfoPrice,
        mgoPrice: form.mgoPrice,
      };

      // 입력한 값만 수동 소비량으로 전달
      for (const [key] of fuelRateFields) {
        if (form[key] !== "") {
          params[key] = Number(form[key]);
        }
      }

      const calculated = calculateFuelCostByOperation(params);
      setResult(calculated);
    } catch (error) {
      alert(error.message);
      setResult(null);
    }
  };

  const basicFields = [
    ["dwt", "DWT (Deadweight)"],
    ["distanceNm", "Voyage Distance (NM)"],
    ["speedKnots", "Speed (knots)"],
    ["seaMargin", "Sea Margin (%)"],
    ["idleDays", "Idle Days (정박 대기 일수)"],
    ["workingDays", "Working Days (하역 작업 일수)"],
  ];

  const priceFields = [
    ["vlsfoPrice", "VLSFO Price (USD/MT)"],
    ["mgoPrice", "MGO Price (USD/MT)"],
  ];

  const renderNumberField = ([name, label]) => (
    <div key={name}>
      <label className="mb-1 block font-medium">{label}</label>
      <input
        type="number"
        name={name}
        value={form[name]}
        onChange={handleChange}
        min="0"
        step="any"
        className="w-full rounded border p-3"
      />
    </div>
  );

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-blue-900">
        Bulk Carrier Fuel Estimator
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        벌크선 항해·정박·하역 연료 소비량 및 예상 연료비 계산
      </p>

      <h3 className="mb-4 border-b pb-2 text-lg font-bold">
        1. Voyage Information
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {basicFields.map(renderNumberField)}
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="font-semibold">Vessel Class (선형)</p>
        <p className="mt-1 text-blue-900">
          {profile?.name ?? "해당 DWT의 기준 데이터가 없습니다."}
        </p>
      </div>

      <h3 className="mb-4 mt-8 border-b pb-2 text-lg font-bold">
        2. Fuel Consumption Rates (MT/day)
      </h3>

      <p className="mb-4 text-sm text-gray-500">
        기본 소비량은 선형 및 선속에 따라 자동 적용됩니다. 실제 선박 소비량을
        알고 있다면 직접 입력할 수 있습니다.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fuelRateFields.map(([name, label]) => (
          <div key={name}>
            <label className="mb-1 block font-medium">
              {label}
              <span className="ml-2 text-xs text-gray-400">(MT/day)</span>
            </label>

            <input
              type="number"
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={
                automaticRates ? numberFormat(automaticRates[name]) : "Auto"
              }
              min="0"
              step="any"
              className="w-full rounded border p-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              {form[name] === "" ? "Auto Applied" : "Manual Override"}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 mt-8 border-b pb-2 text-lg font-bold">
        3. Bunker Prices
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {priceFields.map(renderNumberField)}
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="mt-8 w-full rounded-lg bg-blue-900 p-3 font-bold text-white hover:bg-blue-800"
      >
        Calculate Fuel Consumption
      </button>

      {result && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <h3 className="mb-4 text-xl font-bold text-blue-900">
            4. Fuel Calculation Summary
          </h3>

          <div className="flex justify-between border-b py-2">
            <span>Sea Days (항해 일수)</span>
            <span>{numberFormat(result.seaDays)} days</span>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>VLSFO Consumption</span>
            <span>{numberFormat(result.vlsfoTotal)} MT</span>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>MGO Consumption</span>
            <span>{numberFormat(result.mgoTotal)} MT</span>
          </div>

          <div className="flex justify-between border-b py-2 font-semibold">
            <span>Total Fuel Consumption</span>
            <span>{numberFormat(result.totalFuel)} MT</span>
          </div>

          <h4 className="mb-3 mt-6 font-bold">Consumption by Operation</h4>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Operation</th>
                  <th className="py-2 text-right">VLSFO (MT)</th>
                  <th className="py-2 text-right">MGO (MT)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">At Sea</td>
                  <td className="text-right">
                    {numberFormat(result.seaVlsfoTotal)}
                  </td>
                  <td className="text-right">
                    {numberFormat(result.seaMgoTotal)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Idle</td>
                  <td className="text-right">
                    {numberFormat(result.idleVlsfoTotal)}
                  </td>
                  <td className="text-right">
                    {numberFormat(result.idleMgoTotal)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Working</td>
                  <td className="text-right">
                    {numberFormat(result.workingVlsfoTotal)}
                  </td>
                  <td className="text-right">
                    {numberFormat(result.workingMgoTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="mb-3 mt-6 font-bold">Fuel Cost Breakdown</h4>

          <div className="flex justify-between border-b py-2">
            <span>VLSFO Cost</span>
            <span>${numberFormat(result.vlsfoCost)}</span>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>MGO Cost</span>
            <span>${numberFormat(result.mgoCost)}</span>
          </div>

          <div className="mt-5 flex flex-wrap justify-between gap-2 text-xl font-bold">
            <span>Estimated Fuel Cost</span>
            <span className="text-blue-900">
              ${numberFormat(result.totalCost)}
            </span>
          </div>

          <p className="mt-5 text-xs text-gray-500">
            ※ 선형별 가정 소비량과 입력한 유가를 적용한 추정치입니다. 실제
            선박의 엔진 사양, 적재 상태, 기상, 운항 조건 및 연료 가격에 따라
            달라질 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
