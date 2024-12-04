using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf.Canvas.Draw;
using iText.Kernel.Pdf;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Layout;
using iText.Layout.Borders;
using HelpdeskViewModels;
using HelpdeskDAL;

namespace HelpdeskWebsite.Reports
{
    public class EmployeeReport
    {
        public async Task GenerateEmpReportAsync(string rootPath, List<EmployeeViewModel> employees)
        {
            PageSize pg = PageSize.A4;
            var helvetica = PdfFontFactory.CreateFont(StandardFontFamilies.HELVETICA);
            string filePath = System.IO.Path.Combine(rootPath, "pdfs", "EmployeeReport.pdf");

            using PdfWriter writer = new(filePath);
            using PdfDocument pdf = new(writer);
            using Document document = new(pdf);

            // Add a centered header image
            var headerImage = new Image(ImageDataFactory.Create(System.IO.Path.Combine(rootPath, "img", "Desk.png")))
                .ScaleAbsolute(150, 75)
                .SetHorizontalAlignment(HorizontalAlignment.CENTER)
                .SetMarginBottom(10);
            document.Add(headerImage);

            // Add a styled title
            document.Add(new Paragraph("Employee Report")
                .SetFont(helvetica)
                .SetFontSize(28)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20));

            // Create a table with 3 columns
            Table table = new(3);
            table.SetWidth(UnitValue.CreatePercentValue(100));

            // Add headers with styling
            table.AddHeaderCell(new Cell().Add(new Paragraph("Title").SetBold().SetTextAlignment(TextAlignment.CENTER)));
            table.AddHeaderCell(new Cell().Add(new Paragraph("First Name").SetBold().SetTextAlignment(TextAlignment.CENTER)));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Last Name").SetBold().SetTextAlignment(TextAlignment.CENTER)));


            // Populate the table with alternating row colors
            bool isAlternateRow = false;
            foreach (var employee in employees)
            {
                var backgroundColor = isAlternateRow ? DeviceRgb.WHITE : new DeviceRgb(173, 216, 230);
                isAlternateRow = !isAlternateRow;

                table.AddCell(new Cell().Add(new Paragraph(employee.Title ?? string.Empty))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER));
                table.AddCell(new Cell().Add(new Paragraph(employee.Firstname ?? string.Empty))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER));
                table.AddCell(new Cell().Add(new Paragraph(employee.Lastname ?? string.Empty))
                    .SetBackgroundColor(backgroundColor)
                    .SetTextAlignment(TextAlignment.CENTER));
            }

            // Add the table to the document
            document.Add(table.SetMarginTop(20));

            // Add a date line at the bottom
            document.Add(new LineSeparator(new SolidLine()));
            document.Add(new Paragraph($"Employee report written on - {DateTime.Now}")
                .SetFontSize(8)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(10));
        }
    }
}

