import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  carbonReportSchema,
  CreateCarbonReportInputSchema,
  type CarbonReport,
  type CreateCarbonReportInput,
} from "../schemas/schema";
import GreenSeal from "./GreenSeal";

export default function CarbonReportList() {
  const API_URL = "http://localhost:5003/api/CarbonReport";
  const [carbonReports, setCarbonReports] = useState<CarbonReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<CreateCarbonReportInput>>({
    companyName: "",
    startDate: new Date(),
    endDate: new Date(),
    dieselLiters: 0,
    naturalGasKWh: 0,
    electricityKWh: 0,
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const cleanData = (res.data || [])
        .map((item: any) => {
          const result = carbonReportSchema.safeParse(item);
          return result.success ? result.data : null;
        })
        .filter((item): item is CarbonReport => item !== null);
      setCarbonReports(cleanData);
    } catch (err) {
      setError("Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string | undefined, name: string) => {
    if (!id || !window.confirm(`${name} löschen?`)) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchReports();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateCarbonReportInputSchema.safeParse(formData);
    if (!validation.success) return;
    try {
      await axios.post(API_URL, {
        ...validation.data,
        startDate: validation.data.startDate.toISOString(),
        endDate: validation.data.endDate.toISOString(),
      });
      setIsModalOpen(false);
      setFormData({
        companyName: "",
        startDate: new Date(),
        endDate: new Date(),
        dieselLiters: 0,
        naturalGasKWh: 0,
        electricityKWh: 0,
      });
      fetchReports();
    } catch (err) {
      alert("Fehler beim Speichern.");
    }
  };

  const formatDateForInput = (date: Date | undefined) =>
    date ? new Date(date).toISOString().split("T")[0] : "";
  const filteredReports = carbonReports.filter((r) =>
    r.companyName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- CO2 Faktoren (Standardwerte in t pro Einheit) ---
  const FACTORS = {
    electricity: 0.42 / 1000, // 0,42 kg/kWh -> t/kWh
    naturalGas: 0.202 / 1000, // 0,202 kg/kWh -> t/kWh
    diesel: 2.67 / 1000, // 2,67 kg/L -> t/L
  };

  // Berechnungen für das Gesamt-Dashboard (Dashboard Stats)
  const totalElecKWh = filteredReports.reduce(
    (s, r) => s + (r.electricityKWh || 0),
    0,
  );
  const totalGasKWh = filteredReports.reduce(
    (s, r) => s + (r.naturalGasKWh || 0),
    0,
  );
  const totalDieselL = filteredReports.reduce(
    (s, r) => s + (r.dieselLiters || 0),
    0,
  );

  // CO2 in Tonnen berechnen
  const co2Elec = totalElecKWh * FACTORS.electricity;
  const co2Gas = totalGasKWh * FACTORS.naturalGas;
  const co2Diesel = totalDieselL * FACTORS.diesel;
  const grandTotalCo2 = co2Elec + co2Gas + co2Diesel;

  // Chart Daten (jetzt in Tonnen CO2)
  const chartData = [
    { name: "⚡ Strom", value: parseFloat(co2Elec.toFixed(3)) },
    { name: "🔥 Gas", value: parseFloat(co2Gas.toFixed(3)) },
    { name: "🚜 Diesel", value: parseFloat(co2Diesel.toFixed(3)) },
  ].filter((d) => d.value > 0);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            CO₂-Dashboard
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-0 bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
          >
            ➕ Neuer Bericht
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 Suche..."
          className="w-full max-w-md bg-white border border-gray-200 rounded-2xl px-6 py-3 mb-10 shadow-sm outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBox
              label="Strom"
              val={totalElecKWh}
              unit="kWh"
              col="text-indigo-600"
            />
            <StatBox
              label="Erdgas"
              val={totalGasKWh}
              unit="kWh"
              col="text-emerald-600"
            />
            <StatBox
              label="Diesel"
              val={totalDieselL}
              unit="L"
              col="text-amber-600"
            />
          </div>
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReports.map((report) => {
            // 1. Werte berechnen
            const elec = Number(report.electricityKWh || 0);
            const gas = Number(report.naturalGasKWh || 0);
            const diesel = Number(report.dieselLiters || 0);
            const reportCo2 =
              elec * 0.00042 + gas * 0.000202 + diesel * 0.00267;

            // 2. Logik-Check: Ist der Wert >= 10 Tonnen?
            const isHighEmission = reportCo2 >= 10;

            // 3. Dynamische Klassen festlegen
            const cardStyles = isHighEmission
              ? "bg-blue-200 border-amber-100 hover:bg-amber-50"
              : "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-150";

            const icon = isHighEmission ? "⚠️" : "🌱";
            const textColor = isHighEmission
              ? "text-amber-700"
              : "text-emerald-700";
            const borderInner = isHighEmission
              ? "border-amber-100/50"
              : "border-emerald-100/50";

            return (
              <div
                key={report.id}
                className={`${cardStyles} border rounded-[2.5rem] p-8 shadow-sm transition duration-300 group`}
              >
                <div className="flex justify-between items-start mb-6">
                  <Link
                    to={`/list/${report.id}`}
                    className="text-xl font-bold  hover:text-indigo-600 truncate pr-4"
                  >
                    {report.companyName}
                  </Link>
                  <span className="text-2xl">{icon}</span>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div
                    className={`flex justify-between border-b ${borderInner} pb-2`}
                  >
                    <span className="text-gray-500 italic">⚡ Strom</span>
                    <span className="text-gray-900 font-bold">
                      {elec.toLocaleString()} kWh
                    </span>
                  </div>
                  <div
                    className={`flex justify-between border-b ${borderInner} pb-2`}
                  >
                    <span className="text-gray-500 italic">🔥 Gas</span>
                    <span className="text-gray-900 font-bold">
                      {gas.toLocaleString()} kWh
                    </span>
                  </div>
                  <div
                    className={`flex justify-between border-b ${borderInner} pb-2`}
                  >
                    <span className="text-gray-500 italic">🚜 Diesel</span>
                    <span className="text-gray-900 font-bold">
                      {diesel.toLocaleString()} L
                    </span>
                  </div>
                </div>

                <div
                  className={`pt-4 border-t ${isHighEmission ? "border-amber-200" : "border-emerald-200 "} flex justify-between items-center `}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${isHighEmission ? "text-amber-800/40" : "text-emerald-800/40"}`}
                  >
                    CO₂ Bilanz
                  </span>
                  <span className={`text-sm font-black ${textColor}`}>
                    {reportCo2.toLocaleString("de-DE", {
                      minimumFractionDigits: 3,
                    })}{" "}
                    t CO₂e
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${isHighEmission ? "text-amber-800/30" : "text-emerald-800/30"}`}
                  >
                    {report.startDate
                      ? new Date(report.startDate).toLocaleDateString("de-DE")
                      : ""}
                  </span>
                  <button
                    onClick={() => handleDelete(report.id, report.companyName)}
                    className={`${isHighEmission ? "text-amber-200" : "text-emerald-200"} hover:text-red-500 transition`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10">
            <h3 className="text-2xl font-black mb-8">Neuer Bericht</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Unternehmen"
                className="w-full bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="bg-gray-50 rounded-2xl p-4 text-sm"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: new Date(e.target.value),
                    })
                  }
                />
                <input
                  type="date"
                  className="bg-gray-50 rounded-2xl p-4 text-sm"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <input
                type="number"
                placeholder="⚡ Strom (kWh)"
                className="w-full bg-gray-50 rounded-2xl p-4"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    electricityKWh: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="🔥 Gas (kWh)"
                className="w-full bg-gray-50 rounded-2xl p-4"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    naturalGasKWh: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="🚜 Diesel (L)"
                className="w-full bg-gray-50 rounded-2xl p-4"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dieselLiters: Number(e.target.value),
                  })
                }
              />
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-bold text-gray-400"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-black px-8 py-3 rounded-2xl shadow-xl"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const StatBox = ({ label, val, unit, col }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <p className={`text-2xl font-black mt-1 ${col}`}>
      {val.toLocaleString()} {unit}
    </p>
  </div>
);

const Row = ({ lab, val, unit }: any) => (
  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
    <span className="text-gray-500 italic">{lab}</span>
    <span className="text-gray-900 font-bold">
      {val?.toLocaleString()} {unit}
    </span>
  </div>
);
