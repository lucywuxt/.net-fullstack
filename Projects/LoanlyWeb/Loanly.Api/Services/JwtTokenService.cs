using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Loanly.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Loanly.Api.Services;

public class JwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateCountryToken(Country country)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, $"country:{country.Id}"),
            new(JwtRegisteredClaimNames.Email, country.ContactEmail),
            new("userType", "Country"),
            new(ClaimTypes.Role, "Country"),
            new("countryId", country.Id.ToString()),
            new("countryName", country.Name),
            new("isoAlpha3", country.IsoAlpha3)
        };

        return WriteToken(claims);
    }

    public string GenerateAdminToken(Admin admin)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, $"admin:{admin.Id}"),
            new(JwtRegisteredClaimNames.Email, admin.Email),
            new("userType", "Admin"),
            new(ClaimTypes.Role, "Admin"),
            new("adminId", admin.Id.ToString()),
            new("adminName", admin.Name),
            new("adminRole", admin.Role.ToString())
        };

        return WriteToken(claims);
    }

    private string WriteToken(IEnumerable<Claim> claims)
    {
        var secret = _config["Jwt:Key"] ?? "LoanlySovereignFinancingSuperSecretJwtKey2026_WorldBankClientConnection!";
        var issuer = _config["Jwt:Issuer"] ?? "loanly.wiki";
        var audience = _config["Jwt:Audience"] ?? "loanly.wiki";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
