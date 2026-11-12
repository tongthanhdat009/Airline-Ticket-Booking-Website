<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/doi_soat

## Purpose
Payloads for transaction reconciliation (đối soát giao dịch): run a reconciliation window, list results, inspect one invoice, and attach a resolution note.

## Key Files
| File | Description |
|------|-------------|
| `DoiSoatResponse.java` | Reconciliation row: invoice number, PNR, invoice vs gateway amount, `MATCHED`/`UNMATCHED`, amount difference, transaction id. |
| `DoiSoatDetailResponse.java` | Full detail for one invoice, including customer contact data, invoice status and gateway response fields. |
| `RunReconciliationRequest.java` | Window to reconcile: `tuNgay`, `denNgay`, `includeMatched`. |
| `UpdateReconciliationNoteRequest.java` | Resolution note: `ghiChu`, `nguoiXuLy`, `trangThai` (default `RESOLVED`). |

## For AI Agents

### Working In This Directory
- The `vnpay*` fields are legacy column names kept for the reconciliation schema added in V18 — the gateway itself was dropped (V24/V25); do not reintroduce VNPay logic here.
- `status` is the string `MATCHED` or `UNMATCHED`; the scheduler counts everything that is not `MATCHED` as a mismatch.
- `includeMatched` defaults to false so manual runs report only discrepancies.

### Testing Requirements
- Reconciliation math belongs in a service test; the DTO mapping itself is covered by the controller test.
- Verify a run over a closed period returns zero rows when everything matches.

### Common Patterns
- Builder-style construction is used for `RunReconciliationRequest` (Lombok `@Builder`).
- Amounts are `BigDecimal`; the difference is signed.

## Dependencies

### Internal
- `../../service/DoiSoatGiaoDichService.java` - performs the reconciliation.
- `../../scheduler/ReconciliationScheduler.java` - runs the daily/weekly automatic pass.
- `../../model/HoaDon.java` - invoice rows carrying the reconciliation fields.

### External
- Apache POI - the exported reconciliation report.

<!-- MANUAL: -->
