<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# jasper

## Purpose
JasperReports 6.21.3 templates (`.jrxml`) compiled at runtime to produce PDF hóa đơn, vé máy bay, báo cáo doanh thu and nhật ký thao tác.

## Key Files
| File | Description |
|------|-------------|
| `invoice_report.jrxml` | Hóa đơn. Parameters: invoiceNumber, invoiceDate, customerName/Email/Phone, bookingId, flightNumber, route, departureDate/Time, ticketClass, subtotal/tax/total, paymentStatus/Date. Fields: itemNo, description, quantity, unitPrice, totalPrice, unitPriceFormatted, totalPriceFormatted. |
| `ticket_report.jrxml` | Vé máy bay. Parameters: bookingCode, issueDate, passengerName, flightNumber, bookingDate, travelType, departureDate/Time, arrivalTime, departureCity, arrivalCity, departureAirport, arrivalAirport, ticketClass, seatNumber, totalAmount, passengerCount. Fields: description, quantity, unitPrice, amount. |
| `revenue_report.jrxml` | Báo cáo doanh thu. Parameters: startDate, endDate, totalRevenue, ticketRevenue, serviceRevenue, newCustomers, reportDate. Fields: ngay, doanhThu. |
| `audit_log_report.jrxml` | Nhật ký thao tác. Parameters: reportTitle, reportDate, totalRecords, filterInfo. Fields: maLog, loaiThaoTac, bangAnhHuong, maBanGhi, nguoiThucHien, loaiTaiKhoan, moTa, diaChiIp, thoiGian. |

## For AI Agents

### Working In This Directory
- Templates are loaded from the classpath as `jasper/<name>.jrxml`; never rename a file, the controllers and `Jasper*Service` reference the path literally.
- Parameter and field names are the contract with the Java side: renaming one in the `.jrxml` without the matching map key breaks `fillReport` at runtime.
- `invoice_report.jrxml` is filled from a `Map` data source (`JRMapCollectionDataSource`), so field keys must match exactly.
- Keep the Vietnamese labels and the VND formatting expressions as they are; some values arrive pre-formatted (`unitPriceFormatted`).

### Testing Requirements
- `src/test/java/com/example/j2ee/controller/InvoiceReportTemplateTest.java` compiles and fills `invoice_report.jrxml` with controller-shaped data, then exports a PDF — run it after any change to that template.
- Nothing covers `ticket_report.jrxml`, `revenue_report.jrxml` or `audit_log_report.jrxml`; compile-check them manually before shipping.

### Common Patterns
- `invoice_report.jrxml` is shared by `JasperInvoiceService`, `JasperHoaDonService`, `JasperTicketService` and `ClientInvoiceController` — a change affects all four.
- The old `$F{quantity}` failure was a controller/template shape mismatch; when adding a field, update both sides in the same commit.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/service/JasperInvoiceService.java`, `JasperHoaDonService.java`, `JasperTicketService.java`, `JasperRevenueReportService.java`, `AuditLogService.java` - fill the templates.
- `src/main/java/com/example/j2ee/controller/ClientInvoiceController.java` - streams `invoice_report.jrxml` to the customer.

### External
- JasperReports 6.21.3 (`jasperreports`, `jasperreports-fonts`) - template compile/fill/export; Apache POI - spreadsheet export.

<!-- MANUAL: -->
