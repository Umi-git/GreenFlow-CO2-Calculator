import NavBar from "../features/carbon-reports/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Status Anzeige */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-full px-6 py-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
            </span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800">
              Status:{" "}
              <span className="text-amber-600 font-medium">In Entwicklung</span>
            </h2>
          </div>
        </div>

        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-800 mb-6 tracking-tight">
            Enterprise CO2 Reporting
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Eine hochperformante Fullstack-Lösung zur automatisierten Erfassung,
            Berechnung und Archivierung von Emissionsdaten nach{" "}
            <span className="text-emerald-600 font-semibold">
              CSRD-Standards
            </span>
            .
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Architektur */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-emerald-600 text-3xl mb-4">🏗️</div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Architektur
            </h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <strong className="text-emerald-700">Backend:</strong> .NET Core
                API für komplexe CO2-Logik.
              </li>
              <li>
                <strong className="text-emerald-700">Frontend:</strong> React &
                TypeScript für ein sicheres User Interface.
              </li>
              <li>
                <strong className="text-emerald-700">Cloud:</strong> Azure
                Integration für automatisierte Workflows.
              </li>
            </ul>
          </section>

          {/* Automatisierung & Cloud */}
          <section className="bg-emerald-800 p-8 rounded-2xl shadow-xl text-white transform lg:-translate-y-4">
            <div className="text-3xl mb-4">☁️</div>
            <h2 className="text-xl font-bold mb-4 text-emerald-100">
              Cloud & Automation
            </h2>
            <ul className="space-y-4 text-sm opacity-90">
              <li className="border-b border-emerald-700 pb-2">
                <strong className="block text-emerald-300">
                  Automatisierte Branding:
                </strong>
                Dynamische Generierung von Logos für personalisierte Berichte.
              </li>
              <li className="border-b border-emerald-700 pb-2">
                <strong className="block text-emerald-300">
                  Azure Courier:
                </strong>
                Sichere Übermittlung und Orchestrierung der Berichtsdaten via
                Azure.
              </li>
              <li>
                <strong className="block text-emerald-300">
                  SharePoint Archiv:
                </strong>
                Vollautomatische Ablage der fertigen PDF-Berichte in die
                Unternehmensstruktur.
              </li>
            </ul>
          </section>

          {/* Features */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-emerald-600 text-3xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Features</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <strong className="text-emerald-700">PDF-Engine:</strong>{" "}
                Generierung CSRD-konformer Dokumente.
              </li>
              <li>
                <strong className="text-emerald-700">Dashboard:</strong>{" "}
                Echtzeit-Analyse der Scope 1-3 Emissionen.
              </li>
              <li>
                <strong className="text-emerald-700">Sicherheit:</strong>{" "}
                Rollenbasierter Zugriff auf sensible Umweltdaten.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
