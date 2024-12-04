using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Draw;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using HelpdeskViewModels;

namespace HelpdeskWebsite.Reports
{
    public class CallReport
    {
        public async Task GenerateCallReportAsync(string rootPath, List<CallViewModel> calls)
        {
            PageSize pg = PageSize.A4.Rotate(); // Landscape orientation
            var helvetica = PdfFontFactory.CreateFont(StandardFontFamilies.HELVETICA);
            string filePath = System.IO.Path.Combine(rootPath, "pdfs", "CallReport.pdf");

            using PdfWriter writer = new(filePath);
            using PdfDocument pdf = new(writer);
            using Document document = new(pdf, pg);

            // Add a centered header image with spacing for the title
            var headerImage = new Image(ImageDataFactory.Create(System.IO.Path.Combine(rootPath, "img", "Desk.png")))
                .ScaleAbsolute(120, 120) // Adjust size for better visibility
                .SetHorizontalAlignment(HorizontalAlignment.CENTER) // Centered alignment
                .SetMarginBottom(20); // Add spacing below the image
            document.Add(headerImage);

            // Add a styled title
            document.Add(new Paragraph("Call Report")
                .SetFont(helvetica)
                .SetFontSize(34)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(30)); // Add margin below the title

            // Create a table with 6 columns
            Table table = new(6);
            table.SetWidth(UnitValue.CreatePercentValue(100));

            // Add headers with styling
            table.AddHeaderCell(new Cell().Add(new Paragraph("Opened Date").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Last Name").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Technician").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Problem").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Status").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Closed Date").SetBold().SetTextAlignment(TextAlignment.CENTER)).SetPadding(5));

            // Populate the table with alternating row colors
            bool isAlternateRow = false;
            foreach (var call in calls)
            {
                var backgroundColor = isAlternateRow ? DeviceRgb.WHITE : new DeviceRgb(220, 235, 255); // Light blue for contrast
                isAlternateRow = !isAlternateRow;

                string status = call.DateClosed.HasValue ? "Closed" : "Open";
                string closedDate = call.DateClosed.HasValue ? call.DateClosed.Value.ToShortDateString() : "-";
                string lastName = call.EmployeeName?.Split(' ').LastOrDefault() ?? "Unknown";

                table.AddCell(new Cell().Add(new Paragraph(call.DateOpened.ToShortDateString()))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPadding(5));
                table.AddCell(new Cell().Add(new Paragraph(lastName)) // Use EmployeeName here
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPadding(5));
                table.AddCell(new Cell().Add(new Paragraph(call.TechName ?? "Unknown"))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPadding(5));
                table.AddCell(new Cell().Add(new Paragraph(call.ProblemDescription ?? "Unknown"))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPadding(5));
                table.AddCell(new Cell().Add(new Paragraph(status))
                   .SetBackgroundColor(backgroundColor)
                   .SetTextAlignment(TextAlignment.CENTER)
                   .SetPadding(5));
                table.AddCell(new Cell().Add(new Paragraph(closedDate))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPadding(5));
            }

            // Add the table to the document with top margin
            document.Add(table.SetMarginTop(20));

            // Add a footer line with date
            document.Add(new LineSeparator(new SolidLine()));
            document.Add(new Paragraph($"Call report written on - {DateTime.Now}")
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(10));
        }

    }
}
