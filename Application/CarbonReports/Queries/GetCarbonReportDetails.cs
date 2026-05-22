using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Interfaces;
using AutoMapper;
using Domain.Entities;
using MediatR;


namespace Application.CarbonReports.Queries
{
    public class GetCarbonReportDetails
    {
        public class Query : IRequest<CarbonReportDto>
        {
            public required Guid Id {get; set;}
        }

        public class Handler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<Query, CarbonReportDto>
        {
            /*       public async Task<CarbonReport> Handle(Query request, CancellationToken cancellationToken)
                  {
                      var carbonReport = await context.CarbonReports.FindAsync([request.Id], cancellationToken);
                      if(carbonReport == null) throw new Exception("Carbon Report not found"); 
                      return carbonReport;
                  } */
            public async Task<CarbonReportDto> Handle(Query request, CancellationToken cancellationToken)
            {
                var carbonReport = await context.CarbonReports.FindAsync(new object[] {request.Id} ,cancellationToken);
                if(carbonReport == null) throw new Exception("Carbon Report not found");
                return mapper.Map<CarbonReportDto>(carbonReport);
            }
        }
    }
}