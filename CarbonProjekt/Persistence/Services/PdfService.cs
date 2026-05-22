using System;
using System.IO;
using Application.CarbonReports.Interfaces;
using Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SkiaSharp;

namespace Persistence.Services
{
    public class PdfService : IPdfService
    {
        private const double DieselFactor = 2.67;
        private const double GasFactor = 0.202;
        private const double ElectricityFactor = 0.420;

        private const string ColorElectricity = "#6366F1"; // Indigo
        private const string ColorGas = "#10B981";         // Emerald
        private const string ColorDiesel = "#F59E0B";      // Amber

        public byte[] GenerateCarbonReportPdf(CarbonReport carbonReport)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            string company = string.IsNullOrWhiteSpace(carbonReport.CompanyName) 
                ? "Unbekanntes Unternehmen" 
                : carbonReport.CompanyName;

            double diesel = carbonReport.DieselLiters;
            double gas = carbonReport.NaturalGasKWh;
            double electricity = carbonReport.ElectricityKWh;

            double dieselCo2 = (diesel * DieselFactor) / 1000;
            double gasCo2 = (gas * GasFactor) / 1000;
            double electricityCo2 = (electricity * ElectricityFactor) / 1000;

            double scope1 = dieselCo2 + gasCo2;
            double scope2 = electricityCo2;
            double totalTonnes = scope1 + scope2;

            byte[] chartBytes = GenerateScopeChart(dieselCo2, gasCo2, electricityCo2);
            byte[] sealBytes = GenerateGreenSeal();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(50);
                    page.Size(PageSizes.A4);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Verdana").FontColor(Colors.Grey.Darken3));

                    // --- HEADER ---
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(company).FontSize(24).Bold().FontColor(Colors.Indigo.Darken3);
                            col.Item().Text($"CO₂-Emissionsbericht | ID: {carbonReport.Id}").FontSize(9).FontColor(Colors.Grey.Medium);
                            col.Item().PaddingTop(4).Text($"Zeitraum: {carbonReport.StartDate:dd.MM.yyyy} - {carbonReport.EndDate:dd.MM.yyyy}").FontSize(9).Italic();
                        });
                    });

                    // --- CONTENT ---
                    page.Content().PaddingVertical(25).Column(col =>
                    {
                        col.Item().PaddingBottom(12).Text("Berechnungsübersicht").FontSize(14).Bold().FontColor(Colors.Indigo.Darken2);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3); 
                                columns.RelativeColumn(2); 
                                columns.RelativeColumn(1.5f); 
                                columns.RelativeColumn(2); 
                            });

                            table.Header(header =>
                            {
                                var headerStyle = TextStyle.Default.Bold().FontColor(Colors.White);
                                table.Cell().Background(Colors.Indigo.Medium).Padding(6).Text("Kategorie").Style(headerStyle);
                                table.Cell().Background(Colors.Indigo.Medium).Padding(6).AlignRight().Text("Menge").Style(headerStyle);
                                table.Cell().Background(Colors.Indigo.Medium).Padding(6).AlignRight().Text("Faktor").Style(headerStyle);
                                table.Cell().Background(Colors.Indigo.Medium).Padding(6).AlignRight().Text("Emissionen").Style(headerStyle);
                            });

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("⚡ Strom (Scope 2)");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{electricity:N0} kWh");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{ElectricityFactor:N3}");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{electricityCo2:N3} t").Bold().FontColor(ColorElectricity);

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("🔥 Erdgas (Scope 1)");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{gas:N0} kWh");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{GasFactor:N3}");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{gasCo2:N3} t").Bold().FontColor(ColorGas);

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("🚜 Diesel (Scope 1)");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{diesel:N0} L");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{DieselFactor:N3}");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{dieselCo2:N3} t").Bold().FontColor(ColorDiesel);

                            table.Cell().ColumnSpan(3).PaddingTop(10).Text("Summe Scope 1 (Direkt)").Medium();
                            table.Cell().PaddingTop(10).AlignRight().Text($"{scope1:N3} t").Bold();

                            table.Cell().ColumnSpan(3).Text("Summe Scope 2 (Indirekt)").Medium();
                            table.Cell().AlignRight().Text($"{scope2:N3} t").Bold();

                            // KORREKTUR: .XmlAttribute() entfernt
                            table.Cell().ColumnSpan(3).PaddingTop(8).Background(Colors.Indigo.Lighten5).Padding(6).Text("Gesamtfußabdruck").Bold().FontColor(Colors.Indigo.Darken3);
                            table.Cell().PaddingTop(8).Background(Colors.Indigo.Lighten5).Padding(6).AlignRight().Text($"{totalTonnes:N3} t CO₂e").Bold().FontColor(Colors.Indigo.Darken3);
                        });

                        // KORREKTUR: .CornerRadius(8) anstelle von .RoundedCorners(10) verwenden
                        col.Item().PaddingTop(35).Background(Colors.Grey.Lighten4).Padding(15).CornerRadius(8).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Emissionsanteile").FontSize(13).Bold().FontColor(Colors.Grey.Darken3);
                                
                                c.Item().PaddingTop(12).Row(r => {
                                    r.ConstantItem(10).Height(10).Background(ColorElectricity);
                                    r.RelativeItem().PaddingLeft(6).Text($"Strom Scope 2: {electricityCo2:N2} t ({ (totalTonnes > 0 ? (electricityCo2/totalTonnes*100) : 0):N0}%)").FontSize(10);
                                });
                                
                                c.Item().PaddingTop(6).Row(r => {
                                    r.ConstantItem(10).Height(10).Background(ColorGas);
                                    r.RelativeItem().PaddingLeft(6).Text($"Erdgas Scope 1: {gasCo2:N2} t ({ (totalTonnes > 0 ? (gasCo2/totalTonnes*100) : 0):N0}%)").FontSize(10);
                                });

                                c.Item().PaddingTop(6).Row(r => {
                                    r.ConstantItem(10).Height(10).Background(ColorDiesel);
                                    r.RelativeItem().PaddingLeft(6).Text($"Diesel Scope 1: {dieselCo2:N2} t ({ (totalTonnes > 0 ? (dieselCo2/totalTonnes*100) : 0):N0}%)").FontSize(10);
                                });
                            });

                            if (chartBytes != null && chartBytes.Length > 0)
                            {
                                row.ConstantItem(110).Height(110).Image(chartBytes);
                            }
                        });
                    });

                    // --- FOOTER ---
                    page.Footer().PaddingTop(10).Column(col =>
                    {
                        col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(4).Row(row =>
                        {
                            row.RelativeItem().Text("Dieser Bericht wurde maschinell erstellt und ist ohne Unterschrift gültig.").FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Seite ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                                x.Span(" von ").FontSize(8).FontColor(Colors.Grey.Medium);
                                x.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                        });
                    });
                });

                // SEITE 2: Zertifikat (< 10.0 Tonnen CO2)
                if (totalTonnes > 0 && totalTonnes < 10.0)
                {
                    container.Page(certPage =>
                    {
                        certPage.Margin(50);
                        certPage.Size(PageSizes.A4);
                        certPage.PageColor(Colors.Grey.Lighten5);

                        certPage.Content().Column(col =>
                        {
                            col.Item().PaddingTop(80).AlignCenter().Text("ZERTIFIKAT").FontSize(38).Bold().FontColor(Colors.Green.Medium);
                            col.Item().AlignCenter().Text("für herausragende CO₂-Effizienz").FontSize(16).FontColor(Colors.Grey.Darken1);
                            
                            if (sealBytes != null && sealBytes.Length > 0)
                            {
                                col.Item().PaddingTop(45).AlignCenter().Width(140).Height(140).Image(sealBytes);
                            }

                            col.Item().PaddingTop(45).AlignCenter().Text(company).FontSize(22).Bold().FontColor(Colors.Grey.Darken4);
                            col.Item().AlignCenter().PaddingTop(15).PaddingHorizontal(30).Text(x =>
                            {
                                x.DefaultTextStyle(t => t.LineHeight(1.5f).FontSize(12).FontColor(Colors.Grey.Darken2));
                                x.Span("Dieses Unternehmen hat im aktuellen Berichtszeitraum Gesamtemissionen von nur ");
                                x.Span($"{totalTonnes:N2} t CO₂e").Bold().FontColor(Colors.Green.Darken2);
                                x.Span(" verursacht und erfüllt damit alle Kriterien für das offizielle Low-Carbon-Siegel.");
                            });
                        });
                    });
                }
            });

            return document.GeneratePdf();
        }

        private byte[] GenerateScopeChart(double e, double g, double d)
        {
            if (e == 0 && g == 0 && d == 0) return Array.Empty<byte>();

            int size = 200;
            using var bitmap = new SKBitmap(size, size);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.Transparent);

            float total = (float)(e + g + d);
            float angleE = (float)(e / total * 360);
            float angleG = (float)(g / total * 360);
            float angleD = (float)(d / total * 360);

            var rect = new SKRect(8, 8, size - 8, size - 8);
            float startAngle = -90f;

            if (angleE > 0)
            {
                using var p = new SKPaint { Color = SKColor.Parse(ColorElectricity), IsAntialias = true, Style = SKPaintStyle.Fill };
                canvas.DrawArc(rect, startAngle, angleE, true, p);
                startAngle += angleE;
            }
            if (angleG > 0)
            {
                using var p = new SKPaint { Color = SKColor.Parse(ColorGas), IsAntialias = true, Style = SKPaintStyle.Fill };
                canvas.DrawArc(rect, startAngle, angleG, true, p);
                startAngle += angleG;
            }
            if (angleD > 0)
            {
                using var p = new SKPaint { Color = SKColor.Parse(ColorDiesel), IsAntialias = true, Style = SKPaintStyle.Fill };
                canvas.DrawArc(rect, startAngle, angleD, true, p);
            }

            using var holePaint = new SKPaint { BlendMode = SKBlendMode.Clear, IsAntialias = true };
            canvas.DrawCircle(size / 2f, size / 2f, size * 0.22f, holePaint);

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        
private byte[] GenerateGreenSeal()
{
    int size = 200;
    using var bitmap = new SKBitmap(size, size);
    using var canvas = new SKCanvas(bitmap);
    canvas.Clear(SKColors.Transparent);

    using var paint = new SKPaint { Color = SKColor.Parse("#10B981"), IsAntialias = true, Style = SKPaintStyle.Stroke, StrokeWidth = 5 };
    canvas.DrawCircle(size / 2f, size / 2f, (size / 2f) - 8, paint);
    
    paint.StrokeWidth = 1.5f;
    canvas.DrawCircle(size / 2f, size / 2f, (size / 2f) - 15, paint);

    using var checkPaint = new SKPaint { Color = SKColor.Parse("#10B981"), IsAntialias = true, Style = SKPaintStyle.Stroke, StrokeWidth = 8, StrokeCap = SKStrokeCap.Round, StrokeJoin = SKStrokeJoin.Round };
    using var path = new SKPath();
    path.MoveTo(size * 0.32f, size * 0.5f);
    path.LineTo(size * 0.46f, size * 0.64f);
    path.LineTo(size * 0.72f, size * 0.36f);
    canvas.DrawPath(path, checkPaint);

    // KORREKTUR: Verwendung der klassischen, stabilen SKPaint-Textparameter
    using var textPaint = new SKPaint 
    { 
        Color = SKColor.Parse("#10B981"), 
        IsAntialias = true,
        Typeface = SKTypeface.FromFamilyName("Verdana", SKFontStyle.Bold),
        TextSize = 14f // Nutzen Sie die direkte TextSize-Eigenschaft
    };
    
    string text = "LOW CO₂";
    
    // Berechnet die Textbreite direkt über die Paint-Eigenschaft
    float textWidth = textPaint.MeasureText(text);
    float x = (size / 2f) - (textWidth / 2f);
    float y = size - 30;

    // Garantiert kompatible Signatur: string, float, float, SKPaint
    canvas.DrawText(text, x, y, textPaint);

    using var image = SKImage.FromBitmap(bitmap);
    using var data = image.Encode(SKEncodedImageFormat.Png, 100);
    return data.ToArray();
}



    }
}
