using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.ComponentModel.DataAnnotations;

namespace GreenFlow.API.Controllers;

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
    public IActionResult GetAll() => Ok(_certificates);

    [HttpPost]
    public IActionResult Create([FromBody] CreateCertificateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

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
        if (certificate == null) return NotFound("Certificate not found.");

        var logoPath = "logo.png";
        var logoBytes = System.IO.File.Exists(logoPath) ? System.IO.File.ReadAllBytes(logoPath) : null;

        var moss      = "#2d5a3d";
        var gold      = "#c8a84b";
        var lightGrey = "#9E9E9E";

        // ── CO₂ assessment — benchmarked against IEA/Global Carbon Project data ──
        // Global avg: 4.7 t/person/yr (IEA 2023). Paris-aligned target: ~2 t/person/yr.
        var co2 = certificate.Co2OffsetTonnes;
        string level, levelColor, equivalence, detail, recommendation;

        if (co2 >= 10000)
        {
            level         = "Exceptional Impact";
            levelColor    = "#2d5a3d";
            equivalence   = $"≈ {(co2 / 4.7m):F0} people's annual global footprint offset";
            detail        = $"{co2:F1} t is an industrial-scale offset. The IEA estimates the global average is 4.7 t per person per year — your offset covers thousands of individual footprints and rivals the annual output of a small industrial facility.";
            recommendation = "Publish an annual impact report aligned with GHG Protocol standards. Consider committing to Science Based Targets (SBTi) to lead the sector.";
        }
        else if (co2 >= 1000)
        {
            level         = "High Impact";
            levelColor    = "#3a7d44";
            equivalence   = $"≈ {(co2 / 4.7m):F0} people's annual global footprint offset";
            detail        = $"{co2:F1} t is an organisational-scale offset. Per the Global Carbon Project, this exceeds the annual CO₂ footprint of over {(int)(co2 / 4.7m)} average global citizens combined.";
            recommendation = "Consider setting Science Based Targets and publishing annual sustainability reports. Pair offsets with direct operational emission reductions for maximum credibility.";
        }
        else if (co2 >= 4.7m)
        {
            level         = "Good Impact";
            levelColor    = "#c8a84b";
            equivalence   = $"≈ {(co2 / 4.7m):F1}× the global average annual footprint";
            detail        = $"{co2:F1} t exceeds the global per-capita average of 4.7 t/yr (IEA, 2023). This is a meaningful contribution — equivalent to neutralising the footprint of {(int)(co2 / 4.7m)} average individuals for a full year.";
            recommendation = "A solid step. To move toward the Paris Agreement's ~2 t/person target, consider auditing supply chains and combining offsets with direct reduction commitments.";
        }
        else if (co2 >= 2.0m)
        {
            level         = "Moderate Impact";
            levelColor    = "#c8842b";
            equivalence   = $"≈ {(co2 / 2.0m):F1}× the Paris-aligned 2 t/person target";
            detail        = $"{co2:F1} t is below the global average of 4.7 t/yr but above the Paris-aligned individual target of ~2 t/yr. It represents meaningful personal climate action.";
            recommendation = "A good personal commitment. Increase the offset volume annually and pair with lifestyle or operational changes to approach true net-zero.";
        }
        else
        {
            level         = "Initial Step";
            levelColor    = "#b84040";
            equivalence   = $"Below the 2 t Paris target — every tonne still counts";
            detail        = $"{co2:F1} t is a first step. The global average is 4.7 t/yr per person (IEA, 2023) and the Paris Agreement implies a target of ~2 t/yr. This offset is a meaningful start to a sustainability journey.";
            recommendation = "Calculate your full carbon footprint using tools like the GHG Protocol or My Climate. Build a roadmap to increase offsets and reduce direct emissions year over year.";
        }

        var pdfBytes = Document.Create(container =>
        {
            // ── PAGE 1: CERTIFICATE ───────────────────────────────────────────
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(0);
                page.DefaultTextStyle(x => x.FontFamily("DM Sans"));

                page.Header().Height(18).Background(moss);
                page.Footer().Height(6).Background(gold);

                page.Content()
                    .Padding(30)
                    .Border(2).BorderColor(gold)
                    .Padding(4)
                    .Border(0.5f).BorderColor(gold)
                    .AlignMiddle()
                    .AlignCenter()
                    .Column(inner =>
                    {
                        inner.Spacing(0);

                        inner.Item().PaddingBottom(6).AlignCenter()
                            .Text("GREENFLOW CARBON REGISTRY")
                            .SemiBold().FontColor(lightGrey).FontSize(9).LetterSpacing(0.25f);

                        inner.Item().PaddingBottom(6).AlignCenter()
                            .Text("Certificate of Carbon Offset")
                            .FontFamily("Playfair Display").FontSize(34).FontColor(moss).Bold();

                        inner.Item().PaddingBottom(18).AlignCenter()
                            .Text("THIS CERTIFICATE IS PRESENTED TO")
                            .FontSize(8).FontColor(lightGrey).LetterSpacing(0.15f);

                        inner.Item().PaddingBottom(18)
                            .AlignCenter().Width(450)
                            .BorderBottom(1.5f).BorderColor(gold)
                            .AlignCenter()
                            .Text(certificate.RecipientName)
                            .FontFamily("Playfair Display").FontSize(32).Bold().Italic();

                        inner.Item().PaddingBottom(4).AlignCenter()
                            .Text($"for successfully offsetting {certificate.Co2OffsetTonnes:F1} tonnes of CO\u2082 through the")
                            .FontColor(lightGrey).FontSize(10);

                        inner.Item().PaddingBottom(20).AlignCenter()
                            .Text($"{certificate.ProjectName} \u2014 type: {certificate.CertificateType}")
                            .FontColor(moss).FontSize(10).Italic();

                        inner.Item().PaddingTop(20).Row(row =>
                        {
                            row.RelativeItem();

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
                                        ? $"{certificate.ValidUntil.Value:yyyy-MM-dd}" : "\u2014");
                                });
                            });

                            row.RelativeItem().AlignRight().AlignMiddle().Column(logo =>
                            {
                                if (logoBytes != null)
                                    logo.Item().PaddingRight(10).Width(60).Height(60)
                                        .Image(logoBytes).FitArea();
                            });
                        });
                    });
            });

            // ── PAGE 2: CO₂ IMPACT ASSESSMENT ────────────────────────────────
            container.Page(page2 =>
            {
                page2.Size(PageSizes.A4.Landscape());
                page2.Margin(0);
                page2.DefaultTextStyle(x => x.FontFamily("DM Sans"));

                page2.Header().Height(18).Background(moss);
                page2.Footer().Height(6).Background(gold);

                page2.Content()
                    .Padding(30)
                    .Border(2).BorderColor(gold)
                    .Padding(4)
                    .Border(0.5f).BorderColor(gold)
                    .AlignMiddle()
                    .Column(col =>
                    {
                        col.Spacing(0);

                        // ── Title row ──
                        col.Item().PaddingBottom(14).Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item()
                                    .Text("CO\u2082 IMPACT ASSESSMENT")
                                    .FontSize(9).FontColor(lightGrey).SemiBold().LetterSpacing(0.2f);
                                left.Item().PaddingTop(5)
                                    .Text("Carbon Offset Analysis")
                                    .FontFamily("Playfair Display").FontSize(26).FontColor(moss).Bold();
                                left.Item().PaddingTop(4)
                                    .Text($"Certificate {certificate.CertificateNumber}  \u00b7  {certificate.RecipientName}")
                                    .FontSize(9).FontColor(lightGrey);
                            });

                            // Badge
                            row.ConstantItem(170).AlignRight().AlignMiddle()
                                .Border(2).BorderColor(levelColor)
                                .Padding(10)
                                .Column(badge =>
                                {
                                    badge.Item().AlignCenter()
                                        .Text(level)
                                        .FontFamily("Playfair Display").FontSize(13).FontColor(levelColor).Bold();
                                    badge.Item().PaddingTop(4).AlignCenter()
                                        .Text(equivalence)
                                        .FontSize(7).FontColor(lightGrey);
                                });
                        });

                        // ── Divider ──
                        col.Item().Height(1).Background(gold);

                        // ── Big number + label ──
                        col.Item().PaddingTop(16).AlignCenter()
                            .Text($"{co2:F1} t CO\u2082")
                            .FontFamily("Playfair Display").FontSize(48).FontColor(levelColor).Bold();

                        col.Item().PaddingTop(2).AlignCenter()
                            .Text("TOTAL OFFSET ON THIS CERTIFICATE")
                            .FontSize(8).FontColor(lightGrey).SemiBold().LetterSpacing(0.18f);

                        // ── Impact scale bar (5 segments) ──
                        col.Item().PaddingTop(16).PaddingHorizontal(50).Column(scale =>
                        {
                            scale.Item().PaddingBottom(5)
                                .Text("IMPACT SCALE  (benchmarked against IEA & Global Carbon Project 2023 data)")
                                .FontSize(7).FontColor(lightGrey).LetterSpacing(0.08f);

                            scale.Item().Height(12).Row(bar =>
                            {
                                foreach (var c in new[] { "#b84040", "#c8842b", "#c8a84b", "#3a7d44", "#2d5a3d" })
                                    bar.RelativeItem().Background(c);
                            });

                            scale.Item().PaddingTop(4).Row(labels =>
                            {
                                var lbls = new[] { "< 2 t\nInitial", "2–4.7 t\nModerate", "4.7–99 t\nGood", "100–9999 t\nHigh", "\u2265 10 000 t\nExceptional" };
                                foreach (var lbl in lbls)
                                    labels.RelativeItem().AlignCenter()
                                        .Text(lbl).FontSize(7).FontColor(lightGrey);
                            });
                        });

                        // ── Two-column: What this means + Recommendation ──
                        col.Item().PaddingTop(18).PaddingHorizontal(30).Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item()
                                    .Text("WHAT THIS MEANS")
                                    .FontSize(8).FontColor(levelColor).SemiBold().LetterSpacing(0.1f);
                                left.Item().PaddingTop(6)
                                    .Text(detail)
                                    .FontSize(9.5f).FontColor("#444444");
                            });

                            row.ConstantItem(28);

                            row.RelativeItem().Column(right =>
                            {
                                right.Item()
                                    .Text("RECOMMENDATION")
                                    .FontSize(8).FontColor(levelColor).SemiBold().LetterSpacing(0.1f);
                                right.Item().PaddingTop(6)
                                    .Text(recommendation)
                                    .FontSize(9.5f).FontColor("#444444");
                            });
                        });

                        // ── Source note ──
                        col.Item().PaddingTop(16).AlignCenter()
                            .Text($"Benchmarks: IEA Energy-related CO\u2082 Emissions 2023 \u00b7 Global Carbon Project 2024 \u00b7 Paris Agreement 2 t/person target  \u00b7  Certificate {certificate.CertificateNumber}")
                            .FontSize(7).FontColor(lightGrey).Italic();
                    });
            });
        })
        .GeneratePdf();

        return File(pdfBytes, "application/pdf", $"certificate-{certificate.CertificateNumber}.pdf");
    }
}