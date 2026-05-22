
using Domain.Entities;

namespace Application.CarbonReports.Interfaces
{
    public interface IPdfService
    {
        byte[] GenerateCarbonReportPdf(CarbonReport carbonReport);
    }
}