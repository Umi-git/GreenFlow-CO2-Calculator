using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure; // <-- 1. ADD THIS LINE AT THE TOP

var builder = WebApplication.CreateBuilder(args);

// --- Configure QuestPDF License ---
QuestPDF.Settings.License = LicenseType.Community; // <-- 2. ADD THIS LINE HERE

// --- Add services to the container ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// This is a crucial part for connecting Frontend to Backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // The address of your React app
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Type"); 
    });
});

// --- Configure JWT Authentication ---
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    });

builder.Services.AddAuthorization();


// --- Build the application ---
var app = builder.Build();

// --- Configure the HTTP request pipeline (Middleware) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevPolicy"); // Use the CORS policy in development
}

app.UseHttpsRedirection();

app.UseAuthentication(); // This must come before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();