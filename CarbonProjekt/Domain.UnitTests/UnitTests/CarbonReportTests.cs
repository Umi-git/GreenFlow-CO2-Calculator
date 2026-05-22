using System.Net;

using FluentAssertions;
using Xunit;
using Domain.Entities;


namespace Domain.UnitTests
{
    public class CarbonReportTests
    {
        [Fact]
        public void CalculateTotalCo2_ShouldReturnCorrectSum()
        {
            // Arrange
            var report = new CarbonReport
            {
                DieselLiters = 1000,      // 1000 * 2.67 = 2670
                NaturalGasKWh = 5000,     // 5000 * 0.202 = 1010
                ElectricityKWh = 2000     // 2000 * 0.420 = 840
            };

            // Calculated CO2: 2670 + 1010 + 840 = 4520
            report.CalculateEmissions();


            // Scope 1: 2670 + 1010 = 3680
            report.Co2Scope1.Should().Be(3680);
        
        
            // Scope 2: 840
            report.Co2Scope2.Should().Be(840);


        }

        [Fact]
        public void CalculateEmissions_WithZeroValues_ShouldReturnZero()
        {
            // Arrange
            var report = new CarbonReport
            {
                DieselLiters = 0,
                NaturalGasKWh = 0,
                ElectricityKWh = 0
            };
            
            // Act
            report.CalculateEmissions();
            
            // Assert
            report.Co2Scope1.Should().Be(0);
            report.Co2Scope2.Should().Be(0);
        }
    
    }
}