using System;
using Application.CarbonReports.Interfaces;
using Application.CarbonReports.Queries;
using AutoMapper;
using Domain.Entities;
using MediatR;




namespace Application.CarbonReports.Commands;

    public class CreateCarbonReport
    {
        public class Command : IRequest<CarbonReportDto>
    {
        //public required CarbonReport CarbonReport{get; set;}
        public string CompanyName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double DieselLiters { get; set; }
        public double NaturalGasKWh { get; set; }
        public double ElectricityKWh { get; set; }
        public string? CreatedBy { get; set; }

    }

    public class Handler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<Command, CarbonReportDto>
    {
   
        public async Task<CarbonReportDto> Handle(Command request, CancellationToken cancellationToken)
        {
           var carbonReport = new CarbonReport
           {
               CompanyName = request.CompanyName,
               StartDate   = request.StartDate,
               EndDate     = request.EndDate,
               DieselLiters = request.DieselLiters,
               NaturalGasKWh = request.NaturalGasKWh,
               ElectricityKWh = request.ElectricityKWh,
               CreatedBy = request.CreatedBy
           };

           // BErechnungen ausführem
           carbonReport.CalculateEmissions();

            // in SQLite speichern
           context.CarbonReports.Add(carbonReport);
           await context.SaveChangesAsync(cancellationToken);

            // Als DTO zurückgeben
           return mapper.Map<CarbonReportDto>(carbonReport);
        }
    }
}
