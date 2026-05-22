import type { CarbonReport } from "../features/carbon-reports/schemas/schema";
import CarbonReportList from "../features/carbon-reports/components/CarbonReportList";
import NavBar from "../features/carbon-reports/components/NavBar";
export default function Main({
  carbonReports,
}: {
  carbonReports: CarbonReport[];
}) {
  console.log(carbonReports);

  return (
    <div>
      <NavBar />
      <h1>Carbon Reports</h1>
      <CarbonReportList />
    </div>
  );
}
