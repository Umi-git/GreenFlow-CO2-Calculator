
using MediatR;
using System;
using System.Threading;
using Application.CarbonReports.Interfaces;

namespace Application.CarbonReports.Commands
{
    public class DeleteCarbonReport
    {
        public class Command : IRequest {public Guid Id {get; set;}}
      
        public class Handler(IApplicationDbContext  context) : IRequestHandler<Command>
        {
            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var carbonReport = await context.CarbonReports.FindAsync(new object[] {request.Id}, cancellationToken)
                    ?? throw new Exception("Cannot find carbon report");

                context.CarbonReports.Remove(carbonReport);
                await context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}