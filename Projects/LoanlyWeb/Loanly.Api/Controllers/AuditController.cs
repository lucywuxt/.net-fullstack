using System.Security.Claims;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly FinancingService _financing;

    public AuditController(FinancingService financing)
    {
        _financing = financing;
    }

    [HttpGet("withdrawal/{id:int}")]
    public async Task<ActionResult<List<AuditLogEntryDto>>> GetWithdrawalHistory(int id)
    {
        return Ok(await _financing.GetAuditLogAsync("WithdrawalApplication", id, GetCallerCountryIdIfCountry()));
    }

    [HttpGet("project/{id:int}")]
    public async Task<ActionResult<List<AuditLogEntryDto>>> GetProjectHistory(int id)
    {
        return Ok(await _financing.GetAuditLogAsync("Project", id, GetCallerCountryIdIfCountry()));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<AuditLogEntryDto>>> GetRecent([FromQuery] int take = 50)
    {
        return Ok(await _financing.GetRecentAuditLogAsync(GetCallerCountryIdIfCountry(), take));
    }

    private int? GetCallerCountryIdIfCountry()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        return role == "Country" ? int.Parse(User.FindFirstValue("countryId") ?? "0") : null;
    }
}
