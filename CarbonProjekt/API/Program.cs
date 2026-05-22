using Application.CarbonReports.Interfaces;
using Application.Core;
using Persistence.Services;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Add services to the container.

builder.Services.AddControllers();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IApplicationDbContext>(provider => 
    provider.GetRequiredService<AppDbContext>());

builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(Application.CarbonReports.Commands.CreateCarbonReport).Assembly)
);
builder.Services.AddScoped<IPdfService, PdfService>();


builder.Services.AddAutoMapper(map => {}, typeof(MappingProfiles));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();



var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 3. Routing AKTIVIEREN (Wichtig: Muss vor Authorization und MapControllers stehen)
app.UseRouting();

// 4. CORS (Sollte zwischen Routing und Authorization stehen)
app.UseCors("AllowReactApp");

// 5. Sicherheit
app.UseAuthorization();

// 6. Endpunkte mappen
app.MapControllers();

app.Run();
