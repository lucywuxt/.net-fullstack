using Loanly.Api.Models;

namespace Loanly.Api.Data;

public static partial class DbSeeder
{
    private static async Task SeedDisbursementsAndIndicatorsAsync(
        LoanlyDbContext db,
        Admin admin,
        Country kenya,
        Country india,
        Country brazil,
        Country colombia,
        Project pKenyaGrid,
        Project pKenyaHealth,
        Project pIndiaTransit,
        Project pBrazilAmazon,
        WithdrawalApplication wa1,
        WithdrawalApplication wa2,
        WithdrawalApplication wa5,
        WithdrawalApplication wa7,
        WithdrawalApplication wa9,
        WithdrawalApplication wa10)
    {
        var disbursements = new[]
        {
            new Disbursement { WithdrawalApplicationId = wa1.Id, AmountDisbursed = 28_000_000m, DesignatedAccountBalanceAfter = 122_000_000m, DisbursedAt = DateTime.UtcNow.AddMonths(-14).AddDays(6), TransactionReference = "IDA-DISB-202508-0091" },
            new Disbursement { WithdrawalApplicationId = wa2.Id, AmountDisbursed = 22_000_000m, DesignatedAccountBalanceAfter = 100_000_000m, DisbursedAt = DateTime.UtcNow.AddMonths(-8).AddDays(5), TransactionReference = "IDA-DISB-202602-0095" },
            new Disbursement { WithdrawalApplicationId = wa5.Id, AmountDisbursed = 19_500_000m, DesignatedAccountBalanceAfter = 65_500_000m, DisbursedAt = DateTime.UtcNow.AddMonths(-5).AddDays(4), TransactionReference = "IDA-GRANT-202605-0093" },
            new Disbursement { WithdrawalApplicationId = wa7.Id, AmountDisbursed = 95_000_000m, DesignatedAccountBalanceAfter = 225_000_000m, DisbursedAt = DateTime.UtcNow.AddMonths(-11).AddDays(7), TransactionReference = "IBRD-DISB-202511-0092" },
            new Disbursement { WithdrawalApplicationId = wa9.Id, AmountDisbursed = 60_000_000m, DesignatedAccountBalanceAfter = 150_000_000m, DisbursedAt = DateTime.UtcNow.AddMonths(-7).AddDays(6), TransactionReference = "IBRD-DISB-202603-0094" },
            new Disbursement { WithdrawalApplicationId = wa10.Id, AmountDisbursed = 120_000_000m, DesignatedAccountBalanceAfter = 0m, DisbursedAt = DateTime.UtcNow.AddMonths(-11), TransactionReference = "IBRD-DISB-202509-0088" }
        };
        db.Disbursements.AddRange(disbursements);

        void AddDisbursedAudit(WithdrawalApplication wa, Disbursement d, Country country)
        {
            db.AuditLogEntries.Add(new AuditLogEntry
            {
                EntityType = "WithdrawalApplication",
                EntityId = wa.Id,
                Action = "Disbursed",
                Summary = $"{wa.ApplicationNumber} disbursed ${d.AmountDisbursed:N0} (ref {d.TransactionReference}) by {admin.Name}.",
                PerformedByName = admin.Name,
                PerformedByRole = admin.Role.ToString(),
                CountryId = country.Id,
                CreatedAt = d.DisbursedAt
            });
        }

        AddDisbursedAudit(wa1, disbursements[0], kenya);
        AddDisbursedAudit(wa2, disbursements[1], kenya);
        AddDisbursedAudit(wa5, disbursements[2], kenya);
        AddDisbursedAudit(wa7, disbursements[3], india);
        AddDisbursedAudit(wa9, disbursements[4], brazil);
        AddDisbursedAudit(wa10, disbursements[5], colombia);

        db.ResultsIndicators.AddRange(
            new ResultsIndicator { ProjectId = pKenyaGrid.Id, IndicatorName = "People provided with new or improved solar mini-grid electricity", Unit = "beneficiaries", BaselineValue = 0m, TargetValue = 450_000m, CurrentValue = 215_000m },
            new ResultsIndicator { ProjectId = pKenyaGrid.Id, IndicatorName = "Clean renewable mini-grid generation capacity installed", Unit = "MW", BaselineValue = 4.5m, TargetValue = 65.0m, CurrentValue = 31.2m },
            new ResultsIndicator { ProjectId = pKenyaGrid.Id, IndicatorName = "Rural health clinics & agricultural hubs connected to reliable power", Unit = "facilities", BaselineValue = 12m, TargetValue = 380m, CurrentValue = 194m },
            new ResultsIndicator { ProjectId = pKenyaHealth.Id, IndicatorName = "Primary healthcare facilities with functional solar cold-chain storage", Unit = "%", BaselineValue = 38.0m, TargetValue = 92.0m, CurrentValue = 67.5m },
            new ResultsIndicator { ProjectId = pKenyaHealth.Id, IndicatorName = "Deliveries attended by skilled health personnel in target counties", Unit = "%", BaselineValue = 54.0m, TargetValue = 85.0m, CurrentValue = 71.2m },
            new ResultsIndicator { ProjectId = pIndiaTransit.Id, IndicatorName = "Zero-emission electric buses deployed and operational", Unit = "buses", BaselineValue = 120m, TargetValue = 2_400m, CurrentValue = 970m },
            new ResultsIndicator { ProjectId = pIndiaTransit.Id, IndicatorName = "Estimated annual GHG emissions avoided in urban transport corridors", Unit = "kt CO2e/yr", BaselineValue = 0m, TargetValue = 185m, CurrentValue = 74.5m },
            new ResultsIndicator { ProjectId = pBrazilAmazon.Id, IndicatorName = "Forest area brought under sustainable community management plans", Unit = "hectares", BaselineValue = 120_000m, TargetValue = 1_250_000m, CurrentValue = 540_000m }
        );

        await db.SaveChangesAsync();
    }
}
