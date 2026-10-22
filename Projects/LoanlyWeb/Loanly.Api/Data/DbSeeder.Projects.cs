using Loanly.Api.Models;

namespace Loanly.Api.Data;

public static partial class DbSeeder
{
    private static async Task SeedProjectsAsync(
        LoanlyDbContext db,
        Admin ttl,
        Admin disbOfficer,
        Country kenya,
        Country india,
        Country brazil,
        Country vietnam,
        Country nigeria,
        Country colombia)
    {
        var pKenyaGrid = new Project { ProjectCode = "P178401", Title = "Kenya Green Mini-Grid & Rural Electrification Scale-Up", CountryId = kenya.Id, Sector = ProjectSector.Climate, FinancingInstrument = FinancingInstrument.IDACredit, ApprovedAmount = 150_000_000m, Status = ProjectStatus.Active, BoardApprovalDate = DateTime.UtcNow.AddMonths(-18), ClosingDate = DateTime.UtcNow.AddYears(3), ProjectDevelopmentObjective = "Increase access to clean, reliable solar mini-grid electricity for underserved rural households, clinics, and agricultural enterprises." };
        var pKenyaHealth = new Project { ProjectCode = "P178402", Title = "East Africa Primary Healthcare & Maternal Resilience Project", CountryId = kenya.Id, Sector = ProjectSector.Health, FinancingInstrument = FinancingInstrument.IDAGrant, ApprovedAmount = 85_000_000m, Status = ProjectStatus.Active, BoardApprovalDate = DateTime.UtcNow.AddMonths(-10), ClosingDate = DateTime.UtcNow.AddYears(4), ProjectDevelopmentObjective = "Strengthen county-level primary health care supply chains, cold-chain vaccine storage, and maternal health service delivery." };
        var pKenyaDigital = new Project { ProjectCode = "P178403", Title = "Horn of Africa Digital Fiber & Secondary Schools Connectivity", CountryId = kenya.Id, Sector = ProjectSector.Education, FinancingInstrument = FinancingInstrument.IDACredit, ApprovedAmount = 110_000_000m, Status = ProjectStatus.Negotiation, ClosingDate = DateTime.UtcNow.AddYears(5), ProjectDevelopmentObjective = "Expand broadband fiber backbone to 2,400 public secondary schools and train teachers in digital pedagogy." };
        var pIndiaTransit = new Project { ProjectCode = "P178404", Title = "National Zero-Emission Urban Bus & Freight Corridor Program", CountryId = india.Id, Sector = ProjectSector.Infrastructure, FinancingInstrument = FinancingInstrument.IBRDLoan, ApprovedAmount = 320_000_000m, Status = ProjectStatus.Active, BoardApprovalDate = DateTime.UtcNow.AddMonths(-22), ClosingDate = DateTime.UtcNow.AddYears(3), ProjectDevelopmentObjective = "Deploy electric bus rapid transit fleets and high-capacity charging depots across six metropolitan transport authorities." };
        var pBrazilAmazon = new Project { ProjectCode = "P178405", Title = "Amazon Basin Sustainable Bioeconomy & Watershed Protection", CountryId = brazil.Id, Sector = ProjectSector.Climate, FinancingInstrument = FinancingInstrument.IBRDLoan, ApprovedAmount = 210_000_000m, Status = ProjectStatus.Active, BoardApprovalDate = DateTime.UtcNow.AddMonths(-14), ClosingDate = DateTime.UtcNow.AddYears(4), ProjectDevelopmentObjective = "Curb deforestation, expand municipal water sanitation, and finance community bio-enterprises across Amazonian municipalities." };
        var pVietnamDelta = new Project { ProjectCode = "P178406", Title = "Mekong Delta Climate-Resilient Coastal Infrastructure", CountryId = vietnam.Id, Sector = ProjectSector.Infrastructure, FinancingInstrument = FinancingInstrument.IBRDLoan, ApprovedAmount = 195_000_000m, Status = ProjectStatus.BoardApproval, BoardApprovalDate = DateTime.UtcNow.AddDays(-12), ClosingDate = DateTime.UtcNow.AddYears(5), ProjectDevelopmentObjective = "Upgrade salinity-control sluice gates, mangrove flood defenses, and resilient logistics waterways in the Mekong Delta." };
        var pNigeriaEdu = new Project { ProjectCode = "P178407", Title = "Adolescent Girls Secondary Education & Skills Empowerment", CountryId = nigeria.Id, Sector = ProjectSector.Education, FinancingInstrument = FinancingInstrument.IDACredit, ApprovedAmount = 175_000_000m, Status = ProjectStatus.Appraisal, ClosingDate = DateTime.UtcNow.AddYears(5), ProjectDevelopmentObjective = "Improve secondary school transition rates and STEM vocational readiness for adolescent girls in participating states." };
        var pColombiaHealth = new Project { ProjectCode = "P178408", Title = "Regional Hospital Modernization & Telemedicine Network", CountryId = colombia.Id, Sector = ProjectSector.Health, FinancingInstrument = FinancingInstrument.IBRDLoan, ApprovedAmount = 120_000_000m, Status = ProjectStatus.Closed, BoardApprovalDate = DateTime.UtcNow.AddYears(-5), ClosingDate = DateTime.UtcNow.AddMonths(-2), ProjectDevelopmentObjective = "Modernize regional emergency care units and establish rural telemedicine nodes across 14 departments." };

        db.Projects.AddRange(pKenyaGrid, pKenyaHealth, pKenyaDigital, pIndiaTransit, pBrazilAmazon, pVietnamDelta, pNigeriaEdu, pColombiaHealth);
        await db.SaveChangesAsync();

        await SeedTransactionsAsync(db, ttl, disbOfficer, pKenyaGrid, pKenyaHealth, pIndiaTransit, pBrazilAmazon, pColombiaHealth);
    }
}
