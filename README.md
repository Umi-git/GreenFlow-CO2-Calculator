# 🌿 Fullstack CO₂-Emissions Dashboard

Dieses Projekt ist eine Fullstack-Webanwendung zur Erfassung und Analyse von CO₂-Emissionsdaten. Es nutzt ein robustes **ASP.NET Core** Backend und ein typsicheres 
**React-Frontend mit TypeScript**.

## 🏗️ Systemarchitektur

*   **Backend:** ASP.NET Core Web API (C#) auf Port `5003`.
*   **Frontend:** React (Vite) mit TypeScript & Tailwind CSS.
*   **Kommunikation:** RESTful API mit JSON-Payloads und CORS-Integration.

---

## 🚀 Kernfunktionen

*   **Automatische CO₂-Kalkulation:** Umrechnung von kWh/Litern in Tonnen CO₂e direkt im Frontend.
*   **Dynamisches Ampel-System:** Visuelle Unterscheidung zwischen Low-Emission (Grün 🌱) und High-Emission (Amber ⚠️ ab 10t).
*   **Interaktive Statistiken:** Dashboard mit aggregierten Gesamtwerten und Pie-Chart-Visualisierung (Recharts).
*   **Typsicherheit:** End-to-End Typsicherheit durch C# Models im Backend und TypeScript Interfaces/Zod im Frontend.

---

## 📊 Berechnungslage

Die CO₂-Äquivalente werden mit folgenden Faktoren berechnet:
-   **Strom:** 0,42 kg/kWh (dt. Strommix)
-   **Erdgas:** 0,202 kg/kWh
-   **Diesel:** 2,67 kg/Liter

---

## 🛠️ Tech-Stack

### Backend (C# / .NET)
-   **Framework:** ASP.NET Core Web API
-   **Dokumentation:** Postman / OpenAPI 
-   **Daten:** Entity Framework Core (persönliche Datenhaltung)
-   ** Clean Architecture(API, Application, Domain und Persi)

### Frontend (TypeScript / React)
-   **Framework:** React 18 mit TypeScript
-   **Styling:** Tailwind CSS (Modern Card-Design)
-   **Charts:** Recharts
-   **API-Client:** Axios
-   **Validierung:** Zod (Schema-Validierung für Formulare)

---

## 📦 Installation & Setup

### 1. Backend (.NET)
```bash
cd CarbonImpact2
dotnet restore
dotnet run oder dotnet watch run
dotnet ef migrations add InitialCreate --p Persistence --s API
dotnet ef database update --p Persistence --s API


```
*Die API ist standardmäßig unter `http://localhost:5003/api/CarbonReport` dokumentiert.*

### 2. Frontend (React)
```bash
cd Client
npm install
npm run dev
```
*Die App startet unter `http://localhost:5173`.*

---

## 📂 Projektstruktur

├── CarbonImpact2.sln
├── API/           # C# Web API Projekt
│   ├── Controllers/     # CarbonReportController
│   └── Program.cs       # CORS & API Konfiguration
├── Application/
│    ├── CarbonReports  
│    │   ├──Commands/     # CreateCarbonReports, DeleteCarbonReport, EditCarbonReport
│    │   ├── Interfaces/  # IApplicationDbContext, IPdfService
│    │   ├──Queries/      # CarbonReportDto, GetCarbonReportDetails, GetCarbonReportList, GetCarbonReportPdf
│    └── Core      # MapingProfiles
├──Domain/         
│    ├── Entities/  # CarbonReport
├──Persistence/
│   ├──Services/   # PdfService
│   └── AppDbContext
## Hier Fonteend
└── Client/      # React TypeScript Projekt
    ├── src/   #### Noch in Bearbietung also unvollständig
    │   ├── components/  # NavBar, Modal, Cards
    │   ├── schemas/     # Zod-Validierung (schema.ts)
    │   └── App.tsx      # Routing & MainLayout
```

## 📝 Entwicklungshinweise
*   **CORS:** In `Program.cs` ist eine Policy konfiguriert, die Anfragen vom Frontend-Port erlaubt.
*   **TypeScript:** Alle Interfaces in `src/schemas/schema.ts` spiegeln die C# Models wider.

---
**Entwickelt als Fullstack-Showcase für C# und moderne Webtechnologien.**
