using Loanly.Api.Data;
using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Loanly.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Tests;

public class FinancingAndWorldBankTests
{
    private static LoanlyDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<LoanlyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LoanlyDbContext(options);
    }

    [Fact]
    public async Task SubmitAndApproveWithdrawal_EnforcesApprovedAmountCeiling()
    {
        using var db = CreateInMemoryDb();
        var country = new Country { Name = "Kenya", IsoAlpha3 = "KEN", Region = "Sub-Saharan Africa", IncomeLevel = "Lower middle income", ContactEmail = "treasury@kenya.go.ke", PasswordHash = "hash" };
        var admin = new Admin { Name = "TTL Admin", Email = "ttl@worldbank.org", PasswordHash = "hash", Role = AdminRole.TaskTeam };
        db.Countries.Add(country);
        db.Admins.Add(admin);
        await db.SaveChangesAsync();

        var service = new FinancingService(db);
        var project = await service.CreateProjectAsync(new CreateProjectRequestDto(
            "Solar Grid Expansion", country.Id, ProjectSector.Climate, FinancingInstrument.IDACredit,
            10_000_000m, ProjectStatus.Active, DateTime.UtcNow.AddYears(3), "Expand rural solar access"));

        var wa1 = await service.SubmitWithdrawalApplicationAsync(country.Id, new CreateWithdrawalApplicationRequestDto(
            project.Id, ExpenditureCategory.Goods, 6_000_000m, "Invoice #01"));

        var approved1 = await service.ReviewWithdrawalApplicationAsync(wa1.Id, admin.Id,
            new ReviewWithdrawalApplicationRequestDto(WithdrawalStatus.Approved, "Approved"));
        Assert.Equal(WithdrawalStatus.Approved, approved1.Status);

        var disb1 = await service.RecordDisbursementAsync(admin.Id, new RecordDisbursementRequestDto(wa1.Id, 6_000_000m, "TX-001"));
        Assert.Equal(4_000_000m, disb1.DesignatedAccountBalanceAfter);

        await Assert.ThrowsAsync<ServiceValidationException>(() =>
            service.SubmitWithdrawalApplicationAsync(country.Id, new CreateWithdrawalApplicationRequestDto(
                project.Id, ExpenditureCategory.Works, 5_000_000m, "IPC #02")));
    }

    [Fact]
    public async Task ProjectLifecycle_CannotMoveBackwardOrSubmitAgainstNonActiveProject()
    {
        using var db = CreateInMemoryDb();
        var country = new Country { Name = "India", IsoAlpha3 = "IND", Region = "South Asia", IncomeLevel = "Lower middle income", ContactEmail = "dea@gov.in", PasswordHash = "hash" };
        db.Countries.Add(country);
        await db.SaveChangesAsync();

        var service = new FinancingService(db);
        var project = await service.CreateProjectAsync(new CreateProjectRequestDto(
            "Corridor Project", country.Id, ProjectSector.Infrastructure, FinancingInstrument.IBRDLoan,
            50_000_000m, ProjectStatus.Appraisal, DateTime.UtcNow.AddYears(4), "Corridor PDO"));

        await Assert.ThrowsAsync<ServiceValidationException>(() =>
            service.SubmitWithdrawalApplicationAsync(country.Id, new CreateWithdrawalApplicationRequestDto(
                project.Id, ExpenditureCategory.Works, 1_000_000m, "Doc note")));

        await Assert.ThrowsAsync<ServiceValidationException>(() =>
            service.UpdateProjectStatusAsync(project.Id, ProjectStatus.Concept));

        var active = await service.UpdateProjectStatusAsync(project.Id, ProjectStatus.Active);
        Assert.Equal(ProjectStatus.Active, active.Status);
        Assert.NotNull(active.BoardApprovalDate);
    }

    [Fact]
    public void WorldBankParser_NormalizesTwoElementMetadataAndRowsArray()
    {
        string rawWbJson = """
        [
          { "page": 1, "pages": 1, "per_page": 50, "total": 2 },
          [
            {
              "indicator": { "id": "NY.GDP.PCAP.CD", "value": "GDP per capita (current US$)" },
              "country": { "id": "KE", "value": "Kenya" },
              "countryiso3code": "KEN",
              "date": "2023",
              "value": 1952.345
            },
            {
              "indicator": { "id": "NY.GDP.PCAP.CD", "value": "GDP per capita (current US$)" },
              "country": { "id": "1W", "value": "World" },
              "countryiso3code": "WLD",
              "date": "2023",
              "value": 13138.2
            }
          ]
        ]
        """;

        var globalPoints = WorldBankService.ParseWorldBankGlobalArray(rawWbJson);
        Assert.Single(globalPoints);
        Assert.Equal("KEN", globalPoints[0].CountryIso3);
        Assert.Equal(2023, globalPoints[0].Year);
        Assert.Equal(1952.34, globalPoints[0].Value);
    }
}
