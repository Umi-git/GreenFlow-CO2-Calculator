
using Application.CarbonReports.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence;
public class AppDbContext(DbContextOptions options) :  DbContext(options), IApplicationDbContext    
{
    public required  DbSet<CarbonReport> CarbonReports {get; set;}
}
