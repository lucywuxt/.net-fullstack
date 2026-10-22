using Loanly.Api.Models;
using Loanly.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Data;

public static partial class DbSeeder
{
    public const string DefaultDemoPassword = "Password123!";

    public static async Task SeedAsync(LoanlyDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        if (await db.Countries.AnyAsync()) return;

        var hash = PasswordService.HashPassword(DefaultDemoPassword);

        var admin = new Admin { Name = "Admin", Email = "admin@worldbank.org", PasswordHash = hash, Role = AdminRole.TaskTeam };
        db.Admins.Add(admin);

        var kenya = new Country { Name = "Kenya", IsoAlpha3 = "KEN", Region = "Sub-Saharan Africa", IncomeLevel = "Lower middle income", ContactEmail = "treasury@kenya.go.ke", PasswordHash = hash };
        var india = new Country { Name = "India", IsoAlpha3 = "IND", Region = "South Asia", IncomeLevel = "Lower middle income", ContactEmail = "dea-finance@gov.in", PasswordHash = hash };
        var brazil = new Country { Name = "Brazil", IsoAlpha3 = "BRA", Region = "Latin America & Caribbean", IncomeLevel = "Upper middle income", ContactEmail = "seain@fazenda.gov.br", PasswordHash = hash };
        var vietnam = new Country { Name = "Viet Nam", IsoAlpha3 = "VNM", Region = "East Asia & Pacific", IncomeLevel = "Lower middle income", ContactEmail = "mof-external@mof.gov.vn", PasswordHash = hash };
        var nigeria = new Country { Name = "Nigeria", IsoAlpha3 = "NGA", Region = "Sub-Saharan Africa", IncomeLevel = "Lower middle income", ContactEmail = "iedd@finance.gov.ng", PasswordHash = hash };
        var colombia = new Country { Name = "Colombia", IsoAlpha3 = "COL", Region = "Latin America & Caribbean", IncomeLevel = "Upper middle income", ContactEmail = "credito.publico@minhacienda.gov.co", PasswordHash = hash };

        db.Countries.AddRange(kenya, india, brazil, vietnam, nigeria, colombia);
        await db.SaveChangesAsync();

        await SeedProjectsAsync(db, admin, kenya, india, brazil, vietnam, nigeria, colombia);
    }
}
