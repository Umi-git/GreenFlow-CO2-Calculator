import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { carbonReportSchema, type CarbonReport } from "../schemas/schema";
import GreenSeal from "./GreenSeal";

export default function CarbonReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<CarbonReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!id) return;
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const response = await axios.get(
          `http://localhost:5003/api/CarbonReport/${id}`,
        );
        const result = carbonReportSchema.safeParse(response.data);
        if (!result.success) {
          throw new Error(
            "Die API-Daten entsprechen nicht dem erwarteten Schema.",
          );
        }
        if (isMounted) setReport(result.data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Fehler beim Laden.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const response = await axios.get(
        `http://localhost:5003/api/CarbonReport/${id}/pdf`,
        { responseType: "blob" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Bericht_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Das PDF-Dokument konnte nicht generiert werden.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-500 font-sans">
        Lade Details...
      </div>
    );
  if (error)
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg max-w-2xl mx-auto mt-8 font-sans border border-red-200">
        {error}
      </div>
    );
  if (!report)
    return (
      <div className="text-center py-12 text-gray-500 font-sans">
        Kein Bericht gefunden.
      </div>
    );

  // Ressourcen-Werte sichern und in Nummern umwandeln
  const electricity = Number(report.electricityKWh) || 0;
  const gas = Number(report.naturalGasKWh) || 0;
  const diesel = Number(report.dieselLiters) || 0;

  // Einzelne CO2-Werte in Tonnen berechnen
  const co2Electricity = (electricity * 0.42) / 1000;
  const co2Gas = (gas * 0.202) / 1000;
  const co2Diesel = (diesel * 2.67) / 1000;

  // Gesamtwert ermitteln: API-Wert (wird von kg in t umgerechnet) oder Summe der Einzelwerte
  const rawCo2 = report.totalCo2 ? Number(report.totalCo2) : null;
  const totalTonnes =
    rawCo2 !== null ? rawCo2 / 1000 : co2Electricity + co2Gas + co2Diesel;

  // Diagramm-Daten aufbereiten
  const chartData = [
    { name: "⚡ Strom Scope 2", value: Math.round(co2Electricity * 100) / 100 },
    { name: "🔥 Erdgas Scope 1", value: Math.round(co2Gas * 100) / 100 },
    { name: "🚜 Diesel Scope 1", value: Math.round(co2Diesel * 100) / 100 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b"];

  // Nachhaltigkeitssiegel anzeigen, wenn Emissionen maximal 10 Tonnen betragen
  const showSeal = !isNaN(totalTonnes) && totalTonnes <= 10.0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{report.companyName}</h2>
            <p className="text-sm text-indigo-100 mt-1 truncate max-w-xs">
              ID: {report.id}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {downloading ? "⏳ Generiere..." : "📄 PDF"}
            </button>
            <button
              onClick={() => navigate("/list")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ← Liste
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Zeitraum */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Startdatum
              </span>
              <span className="text-gray-800 font-semibold">
                {report.startDate
                  ? new Date(report.startDate).toLocaleDateString("de-DE")
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Enddatum
              </span>
              <span className="text-gray-800 font-semibold">
                {report.endDate
                  ? new Date(report.endDate).toLocaleDateString("de-DE")
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* CO2-Ergebnisbox */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-6 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Berechnete Gesamtemissionen
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-800">
                  {totalTonnes.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-lg font-bold text-slate-500">t CO₂e</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Basierend auf Scopes 1 & 2 Verbrauchsdaten.
              </p>
            </div>

            {/* Nachhaltigkeitssiegel */}
            {showSeal && (
              <div className="flex-shrink-0 bg-white p-2 rounded-full shadow-md border border-emerald-100 transform rotate-3">
                <GreenSeal size="lg" />
              </div>
            )}
          </div>

          {/* Grid für Verbrauch & Diagramm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Ressourcenverbrauch
              </h3>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                <span>⚡ Strom</span>
                <span className="font-bold text-indigo-600">
                  {electricity.toLocaleString("de-DE")} kWh
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                <span>🔥 Erdgas</span>
                <span className="font-bold text-emerald-600">
                  {gas.toLocaleString("de-DE")} kWh
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                <span>🚜 Diesel</span>
                <span className="font-bold text-amber-600">
                  {diesel.toLocaleString("de-DE")} L
                </span>
              </div>
            </div>

            {/* Recharts Chart Container */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center min-h-[220px] w-full relative min-w-[300px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 self-start mb-2">
                Emissionsanteile
              </h3>
              {chartData.length > 0 ? (
                <div className="w-full h-40 relative">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8">
                  Keine Verbrauchsdaten für Diagramm vorhanden.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
