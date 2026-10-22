using Loanly.Api.Data;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LoanlyDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthController(LoanlyDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpGet("demo-accounts")]
    public ActionResult<List<DemoCredentialDto>> GetDemoAccounts()
    {
        return Ok(new List<DemoCredentialDto>
        {
            new("Country", "Kenya — National Treasury (Borrower)", "treasury@kenya.go.ke", DbSeeder.DefaultDemoPassword, "2 Active Projects ($235M IDA Credit/Grant), 1 Negotiation"),
            new("Country", "India — Dept. of Economic Affairs", "dea-finance@gov.in", DbSeeder.DefaultDemoPassword, "1 Active Project ($320M IBRD Loan)"),
            new("Country", "Brazil — SEAIN Ministry of Finance", "seain@fazenda.gov.br", DbSeeder.DefaultDemoPassword, "1 Active Project ($210M IBRD Loan)"),
            new("Admin", "Dr. Elena Vance — Task Team Leader (TTL)", "elena.vance@worldbank.org", DbSeeder.DefaultDemoPassword, "World Bank Task Team Lead (Project Lifecycle, Reviews & Results)"),
            new("Admin", "Marcus Thorne — Disbursement Officer (WFACS)", "marcus.thorne@worldbank.org", DbSeeder.DefaultDemoPassword, "World Bank Finance & Accounting (Withdrawal Approvals & Disbursements)")
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var preferAdmin = string.Equals(request.AccountType, "Admin", StringComparison.OrdinalIgnoreCase);

        if (preferAdmin)
        {
            var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email.ToLower() == email);
            if (admin != null && PasswordService.VerifyPassword(request.Password, admin.PasswordHash))
            {
                var token = _jwt.GenerateAdminToken(admin);
                return Ok(new AuthResponseDto(token, "Admin", admin.Id, admin.Name, admin.Email, admin.Role.ToString(), null, null));
            }
        }

        var country = await _db.Countries.FirstOrDefaultAsync(c => c.ContactEmail.ToLower() == email);
        if (country != null && PasswordService.VerifyPassword(request.Password, country.PasswordHash))
        {
            var token = _jwt.GenerateCountryToken(country);
            return Ok(new AuthResponseDto(token, "Country", country.Id, country.Name, country.ContactEmail, country.Region, country.IsoAlpha3, country.IncomeLevel));
        }

        var fallbackAdmin = await _db.Admins.FirstOrDefaultAsync(a => a.Email.ToLower() == email);
        if (fallbackAdmin != null && PasswordService.VerifyPassword(request.Password, fallbackAdmin.PasswordHash))
        {
            var token = _jwt.GenerateAdminToken(fallbackAdmin);
            return Ok(new AuthResponseDto(token, "Admin", fallbackAdmin.Id, fallbackAdmin.Name, fallbackAdmin.Email, fallbackAdmin.Role.ToString(), null, null));
        }

        return Unauthorized(new { message = "Invalid credentials. Use one of the Client Connection demo accounts or check your email and password." });
    }
}
