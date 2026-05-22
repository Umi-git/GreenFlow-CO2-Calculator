/* using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Application.CarbonReports.Interfaces;
using MediatR;

namespace Application.CarbonReports.Queries;

public record GetCarbonReportPdfQuery(Guid Id) : IRequest<byte[]>;
public class GetCarbonReportPdf(IApplicationDbContext context, IPdfService pdfService) 
    : IRequestHandler<GetCarbonReportPdfQuery, byte[]>
    {

        public async Task<byte[]> Handle(GetCarbonReportPdfQuery request, CancellationToken cancellationToken)
        {
            // Bericht direkt aus der Datenbank laden
            var report = await context.CarbonReports.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (report == null) throw new Exception($"Bericht {request.Id} wurde nicht gefunden.");

            // EXAKTER CHECK: Was steht wirklich physisch in den Tabellenspalten der Datenbank?
            Console.WriteLine(" ======= ROHE DATENBANK-WERTE INNERHALB DES HANDLERS =======");
            Console.WriteLine($"Unternehmen: {report.CompanyName}");
            Console.WriteLine($"Diesel (Aus DB): {report.DieselLiters}");
            Console.WriteLine($"Gas (Aus DB): {report.NaturalGasKWh}");
            Console.WriteLine($"Strom (Aus DB): {report.ElectricityKWh}");
            Console.WriteLine(" ===========================================================");

            // Aufruf des neuen, berechnenden PDF-Service
            var pdf = pdfService.GenerateCarbonReportPdf(report);
            return pdf;
        }


    
}
 */

 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Application.CarbonReports.Interfaces;
using MediatR;

namespace Application.CarbonReports.Queries
{
    public record GetCarbonReportPdfQuery(Guid Id) : IRequest<byte[]>;

    // Umbenannt zu QueryHandler für saubere Struktur und Trennung vom Record
    public class GetCarbonReportPdfQueryHandler : IRequestHandler<GetCarbonReportPdfQuery, byte[]>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPdfService _pdfService;

        // Klassischer Konstruktor (Garantiert fehlerfreie Interface-Erfüllung)
        public GetCarbonReportPdfQueryHandler(IApplicationDbContext context, IPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        public async Task<byte[]> Handle(GetCarbonReportPdfQuery request, CancellationToken cancellationToken)
        {
            // Bericht direkt aus der Datenbank laden
            var report = await _context.CarbonReports
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
                
            if (report == null) 
            {
                throw new Exception($"Bericht {request.Id} wurde nicht gefunden.");
            }

            // EXAKTER CHECK: Was steht wirklich physisch in den Tabellenspalten der Datenbank?
            Console.WriteLine(" ======= ROHE DATENBANK-WERTE INNERHALB DES HANDLERS =======");
            Console.WriteLine($"Unternehmen: {report.CompanyName}");
            Console.WriteLine($"Diesel (Aus DB): {report.DieselLiters}");
            Console.WriteLine($"Gas (Aus DB): {report.NaturalGasKWh}");
            Console.WriteLine($"Strom (Aus DB): {report.ElectricityKWh}");
            Console.WriteLine(" ===========================================================");

            // Aufruf des neuen, berechnenden PDF-Service
            var pdf = _pdfService.GenerateCarbonReportPdf(report);
            return pdf;
        }
    }
}
