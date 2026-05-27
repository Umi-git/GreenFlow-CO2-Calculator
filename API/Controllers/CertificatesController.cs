using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.ComponentModel.DataAnnotations;

namespace GreenFlow.API.Controllers;

// DTO (Data Transfer Object) to receive data from the frontend form
public class CreateCertificateDto
{
    [Required]
    public string RecipientName { get; set; } = string.Empty;
    public string? RecipientEmail { get; set; }
    [Required]
    public string CertificateType { get; set; } = string.Empty;
    [Required]
    public decimal Co2OffsetTonnes { get; set; }
    public string? ProjectName { get; set; }
    [Required]
    public DateOnly IssueDate { get; set; }
    public DateOnly? ValidUntil { get; set; }
    public string? Notes { get; set; }
}

// The actual Certificate model we will use internally
public class Certificate
{
    public Guid Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string CertificateType { get; set; } = string.Empty;
    public decimal Co2OffsetTonnes { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public DateOnly? ValidUntil { get; set; }
    public string Status { get; set; } = "Issued";
}


[ApiController]
[Route("api/certificates")]
public class CertificatesController : ControllerBase
{
    private static readonly List<Certificate> _certificates = new();

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_certificates);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateCertificateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            CertificateNumber = $"GF-{DateTime.UtcNow.Year}-{_certificates.Count + 1:D5}",
            RecipientName = dto.RecipientName,
            CertificateType = dto.CertificateType,
            Co2OffsetTonnes = dto.Co2OffsetTonnes,
            ProjectName = dto.ProjectName ?? "GreenFlow Project",
            IssueDate = dto.IssueDate,
            ValidUntil = dto.ValidUntil,
            Status = "Issued"
        };

        _certificates.Add(certificate);
        return Ok(certificate);
    }

    [HttpGet("{id}/pdf")]
    public IActionResult DownloadPdf(Guid id)
    {
        var certificate = _certificates.FirstOrDefault(c => c.Id == id);
        if (certificate == null)
        {
            return NotFound("Certificate not found.");
        }

        var logoPath = "logo.png";
        var logoBytes = System.IO.File.Exists(logoPath) ? System.IO.File.ReadAllBytes(logoPath) : null;

        var moss = "#2d5a3d";
        var gold = "#c8a84b";
        var lightGrey = "#9E9E9E";

        var pdfBytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(0); // No outer margin — bars go edge to edge
                page.DefaultTextStyle(x => x.FontFamily("DM Sans"));

                // ── TOP GREEN HEADER BAR ──────────────────────────────
                page.Header().Height(18).Background(moss);

                // ── BOTTOM GOLD BAR ───────────────────────────────────
                page.Footer().Height(6).Background(gold);

                // ── MAIN CERTIFICATE AREA — fills exactly between header and footer ──
                page.Content()
                    .Padding(30)
                    .Border(2).BorderColor(gold)
                    .Padding(4)
                    .Border(0.5f).BorderColor(gold)
                    .AlignMiddle()   // vertically center the inner column
                    .AlignCenter()
                    .Column(inner =>
                    {
                        inner.Spacing(0);

                        // Registry label
                        inner.Item().PaddingBottom(6).AlignCenter()
                            .Text("GREENFLOW CARBON REGISTRY")
                            .SemiBold().FontColor(lightGrey).FontSize(9).LetterSpacing(0.25f);

                        // Title
                        inner.Item().PaddingBottom(6).AlignCenter()
                            .Text("Certificate of Carbon Offset")
                            .FontFamily("Playfair Display").FontSize(34).FontColor(moss).Bold();

                        // Subtitle
                        inner.Item().PaddingBottom(18).AlignCenter()
                            .Text("THIS CERTIFICATE IS PRESENTED TO")
                            .FontSize(8).FontColor(lightGrey).LetterSpacing(0.15f);

                        // Recipient name with underline
                        inner.Item().PaddingBottom(18)
                            .AlignCenter()
                            .Width(450)
                            .BorderBottom(1.5f).BorderColor(gold)
                            .AlignCenter()
                            .Text(certificate.RecipientName)
                            .FontFamily("Playfair Display").FontSize(32).Bold().Italic();

                        // Description line 1
                        inner.Item().PaddingBottom(4).AlignCenter()
                            .Text($"for successfully offsetting {certificate.Co2OffsetTonnes:F1} tonnes of CO₂ through the")
                            .FontColor(lightGrey).FontSize(10);

                        // Description line 2 — project + type
                        inner.Item().PaddingBottom(20).AlignCenter()
                            .Text($"{certificate.ProjectName} — type: {certificate.CertificateType}")
                            .FontColor(moss).FontSize(10).Italic();

                        // Dates + Logo row
                        inner.Item().PaddingTop(20).Row(row =>
                        {
                            // Left spacer
                            row.RelativeItem();

                            // Dates centered
                            row.AutoItem().AlignMiddle().Column(dates =>
                            {
                                dates.Item().AlignCenter().Text(text =>
                                {
                                    text.DefaultTextStyle(x => x.FontSize(9));
                                    text.Span("Date: ").FontColor(lightGrey);
                                    text.Span($"{certificate.IssueDate:yyyy-MM-dd}");
                                    text.Span("     ");
                                    text.Span("Valid until: ").FontColor(lightGrey);
                                    text.Span(certificate.ValidUntil.HasValue
                                        ? $"{certificate.ValidUntil.Value:yyyy-MM-dd}"
                                        : "—");
                                });
                            });

                            // Logo — bottom right
                            row.RelativeItem().AlignRight().AlignMiddle().Column(logo =>
                            {
                                if (logoBytes != null)
                                {
                                    logo.Item().PaddingRight(10).Width(60).Height(60)
                                        .Image(logoBytes).FitArea();
                                }
                            });
                        });
                    });
            });
        })
        .GeneratePdf();

        return File(pdfBytes, "application/pdf", $"certificate-{certificate.CertificateNumber}.pdf");
    }
}
