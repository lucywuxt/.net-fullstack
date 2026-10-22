using Loanly.Api.Models;

namespace Loanly.Api.Data;

public static partial class DbSeeder
{
    private static async Task SeedTransactionsAsync(
        LoanlyDbContext db,
        Admin ttl,
        Admin disb,
        Project pKenyaGrid,
        Project pKenyaHealth,
        Project pIndiaTransit,
        Project pBrazilAmazon,
        Project pColombiaHealth)
    {
        var wa1 = new WithdrawalApplication { ApplicationNumber = "WA-2025-0091", ProjectId = pKenyaGrid.Id, Category = ExpenditureCategory.Goods, AmountRequested = 28_000_000m, SupportingDocumentsNote = "Contract KEN-SOLAR-01: 45MW LFP battery inverters & PV modules (Invoice #INV-8821).", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddMonths(-14), ReviewedAt = DateTime.UtcNow.AddMonths(-14).AddDays(4), ReviewedByAdminId = ttl.Id, ReviewNotes = "No-objection issued under STEP plan; invoices verified." };
        var wa2 = new WithdrawalApplication { ApplicationNumber = "WA-2025-0095", ProjectId = pKenyaGrid.Id, Category = ExpenditureCategory.Works, AmountRequested = 22_000_000m, SupportingDocumentsNote = "Civil works IPC #03 & #04 for Turkana and Garissa substations (Engineer Cert #IEC-19).", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddMonths(-8), ReviewedAt = DateTime.UtcNow.AddMonths(-8).AddDays(3), ReviewedByAdminId = disb.Id, ReviewNotes = "IPCs verified against environmental & social safeguards." };
        var wa3 = new WithdrawalApplication { ApplicationNumber = "WA-2026-0098", ProjectId = pKenyaGrid.Id, Category = ExpenditureCategory.ConsultingServices, AmountRequested = 18_500_000m, SupportingDocumentsNote = "Owner's Engineer Grid Integration Supervision Milestone #5 deliverable certificate.", Status = WithdrawalStatus.Approved, SubmittedAt = DateTime.UtcNow.AddDays(-11), ReviewedAt = DateTime.UtcNow.AddDays(-3), ReviewedByAdminId = ttl.Id, ReviewNotes = "Cleared by TTL. Ready for WFACS disbursement execution." };
        var wa4 = new WithdrawalApplication { ApplicationNumber = "WA-2026-0100", ProjectId = pKenyaGrid.Id, Category = ExpenditureCategory.Training, AmountRequested = 6_400_000m, SupportingDocumentsNote = "Statement of Expenditures (SOE-2026-Q3) for 320 mini-grid technicians workshops.", Status = WithdrawalStatus.Submitted, SubmittedAt = DateTime.UtcNow.AddDays(-2) };
        var wa5 = new WithdrawalApplication { ApplicationNumber = "WA-2026-0093", ProjectId = pKenyaHealth.Id, Category = ExpenditureCategory.Goods, AmountRequested = 19_500_000m, SupportingDocumentsNote = "UNOPS/KEMSA procurement of solar vaccine refrigerators for 420 rural dispensaries.", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddMonths(-5), ReviewedAt = DateTime.UtcNow.AddMonths(-5).AddDays(2), ReviewedByAdminId = disb.Id, ReviewNotes = "Verified delivery receipts across 18 counties." };
        var wa6 = new WithdrawalApplication { ApplicationNumber = "WA-2026-0099", ProjectId = pKenyaHealth.Id, Category = ExpenditureCategory.OperatingCosts, AmountRequested = 9_200_000m, SupportingDocumentsNote = "Quarterly IFR Q2-2026 for mobile maternal outreach clinics operating costs.", Status = WithdrawalStatus.UnderReview, SubmittedAt = DateTime.UtcNow.AddDays(-5), ReviewedAt = DateTime.UtcNow.AddDays(-1), ReviewedByAdminId = ttl.Id, ReviewNotes = "Verifying county co-financing ledger reconciliation." };
        var wa7 = new WithdrawalApplication { ApplicationNumber = "WA-2025-0092", ProjectId = pIndiaTransit.Id, Category = ExpenditureCategory.Goods, AmountRequested = 95_000_000m, SupportingDocumentsNote = "Tranche 1 Delivery of 850 electric transit buses & fast chargers (IPC #IND-EBUS-01).", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddMonths(-11), ReviewedAt = DateTime.UtcNow.AddMonths(-11).AddDays(5), ReviewedByAdminId = ttl.Id, ReviewNotes = "Approved following independent verification." };
        var wa8 = new WithdrawalApplication { ApplicationNumber = "WA-2026-0097", ProjectId = pIndiaTransit.Id, Category = ExpenditureCategory.Works, AmountRequested = 48_000_000m, SupportingDocumentsNote = "132kV depot substation civil works across Bengaluru, Ahmedabad, and Chennai.", Status = WithdrawalStatus.Approved, SubmittedAt = DateTime.UtcNow.AddDays(-8), ReviewedAt = DateTime.UtcNow.AddDays(-2), ReviewedByAdminId = ttl.Id, ReviewNotes = "TTL technical clearance granted." };
        var wa9 = new WithdrawalApplication { ApplicationNumber = "WA-2025-0094", ProjectId = pBrazilAmazon.Id, Category = ExpenditureCategory.Works, AmountRequested = 60_000_000m, SupportingDocumentsNote = "Municipal water treatment & watershed restoration across Pará and Amazonas.", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddMonths(-7), ReviewedAt = DateTime.UtcNow.AddMonths(-7).AddDays(4), ReviewedByAdminId = disb.Id, ReviewNotes = "Environmental compliance confirmed." };
        var wa10 = new WithdrawalApplication { ApplicationNumber = "WA-2024-0088", ProjectId = pColombiaHealth.Id, Category = ExpenditureCategory.Goods, AmountRequested = 120_000_000m, SupportingDocumentsNote = "Consolidated final disbursement for regional hospital ICU & telemedicine.", Status = WithdrawalStatus.Disbursed, SubmittedAt = DateTime.UtcNow.AddYears(-1), ReviewedAt = DateTime.UtcNow.AddYears(-1).AddDays(3), ReviewedByAdminId = disb.Id, ReviewNotes = "Final disbursement prior to project closing." };

        db.WithdrawalApplications.AddRange(wa1, wa2, wa3, wa4, wa5, wa6, wa7, wa8, wa9, wa10);
        await db.SaveChangesAsync();

        await SeedDisbursementsAndIndicatorsAsync(db, pKenyaGrid, pKenyaHealth, pIndiaTransit, pBrazilAmazon, wa1, wa2, wa5, wa7, wa9, wa10);
    }
}
