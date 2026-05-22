import "./App.css";
import Home from "./components/Home";
import Reports from "./components/Reports";
import CarbonReportDetail from "./features/carbon-reports/components/CarbonReportDetail";
import CarbonReportList from "./features/carbon-reports/components/CarbonReportList";
import MainLayout from "./features/carbon-reports/components/MainLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<CarbonReportList />} />
          <Route path="/list/:id" element={<CarbonReportDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
