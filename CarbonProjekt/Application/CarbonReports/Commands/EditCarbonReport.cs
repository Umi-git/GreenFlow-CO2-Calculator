using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Interfaces;
using Application.CarbonReports.Queries;
using AutoMapper;
using Domain.Entities;
using MediatR;


namespace Application.CarbonReports.Commands
{
    public class EditCarbonReport
    {
        public class Command : IRequest<CarbonReportDto>
        {
            //public required CarbonReport CarbonReport {get; set;}
            public Guid Id { get; set; }
            public string CompanyName { get; set; } = string.Empty;
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public double DieselLiters { get; set; }
            public double NaturalGasKWh { get; set; }
            public double ElectricityKWh { get; set; }
        }

        public class Handler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<Command, CarbonReportDto>
        {
            public async Task<CarbonReportDto> Handle(Command request, CancellationToken cancellationToken)
            {
                // 1. Bestehenden Bericht aus SQLite laden
               var carbonReport = await context.CarbonReports.FindAsync( new object[] {request.Id}, cancellationToken);
 
                if(carbonReport == null)
                {
                    throw new Exception($"Carbon report with {request.Id} not found"); 
                }
                
                 // Werte aus dem Command überschreiben   
                carbonReport.CompanyName = request.CompanyName;
                carbonReport.DieselLiters = request.DieselLiters;
                carbonReport.ElectricityKWh = request.ElectricityKWh;
                carbonReport.NaturalGasKWh = request.NaturalGasKWh;
                carbonReport.StartDate = request.StartDate;
                carbonReport.EndDate = request.EndDate;
                
                // Berechnungen ausführen
                carbonReport.CalculateEmissions();

                          

              //  mapper.Map(request.CarbonReport, carbonReport);
                await context.SaveChangesAsync(cancellationToken);

                return mapper.Map<CarbonReportDto>(carbonReport);

            }
        }

    }

}