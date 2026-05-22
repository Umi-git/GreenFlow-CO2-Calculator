using System;
using Application.CarbonReports.Interfaces;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace Application.CarbonReports.Queries
{
    public class GetCarbonReportList
    {
       
        public class Query : IRequest<List<CarbonReportDto>>{};

        public class Handler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<Query, List<CarbonReportDto>>
        {
        
            public async Task<List<CarbonReportDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var reports = await context.CarbonReports.ToListAsync(cancellationToken);
                return mapper.Map<List<CarbonReportDto>>(reports);
            }
        }
    }
}