using System;
using System.ComponentModel.DataAnnotations.Schema; // ZWINGEND ERFORDERLICH FÜR [Column]

namespace Domain.Entities
{
    public class CarbonReport 
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CompanyName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public double DieselLiters { get; set; }

        // KORREKTUR: Erzwingt, dass EF Core die Spaltennamen so liest, wie SQL sie angelegt hat
        [Column("NaturalGasKwh")] // Falls SQL ein kleines 'w' nutzt
        public double NaturalGasKWh { get; set; }

        [Column("ElectricityKwh")] // Falls SQL ein kleines 'w' nutzt
        public double ElectricityKWh { get; set; }

        public double Co2Scope1 { get; private set; }
        public double Co2Scope2 { get; private set; }
        
        public double TotalCo2 => Co2Scope1 + Co2Scope2;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public void CalculateEmissions()
        {
            const double dieselFactor = 2.67;
            const double gasFactor = 0.202;
            const double electricityFactor = 0.420;

            // Nutzen Sie hier die internen Felder
            this.Co2Scope1 = (this.DieselLiters * dieselFactor) + (this.NaturalGasKWh * gasFactor);
            this.Co2Scope2 = this.ElectricityKWh * electricityFactor;
        }
    }
}
