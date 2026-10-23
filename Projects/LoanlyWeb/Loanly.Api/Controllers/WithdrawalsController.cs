using System.Security.Claims;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/withdrawals")]
[Authorize]
public class WithdrawalsController : ControllerBase
{
    private readonly FinancingService _financing;

    public WithdrawalsController(FinancingService financing)
    {
        _financing = financing;
    }

    [HttpGet]
    public async Task<ActionResult<List<WithdrawalApplicationDto>>> GetWithdrawals([FromQuery] int? countryId = null)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Country")
        {
            int callerCountryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
            return Ok(await _financing.GetWithdrawalApplicationsAsync(callerCountryId));
        }

        return Ok(await _financing.GetWithdrawalApplicationsAsync(countryId));
    }

    [HttpPost]
    [Authorize(Roles = "Country")]
    public async Task<ActionResult<WithdrawalApplicationDto>> SubmitWithdrawal([FromBody] CreateWithdrawalApplicationRequestDto request)
    {
        try
        {
            int countryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
            var created = await _financing.SubmitWithdrawalApplicationAsync(countryId, request);
            return Ok(created);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WithdrawalApplicationDto>> ReviewWithdrawal(
        int id,
        [FromBody] ReviewWithdrawalApplicationRequestDto request)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue("adminId") ?? "0");
            var updated = await _financing.ReviewWithdrawalApplicationAsync(id, adminId, request);
            return Ok(updated);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("disbursements")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DisbursementDto>> RecordDisbursement([FromBody] RecordDisbursementRequestDto request)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue("adminId") ?? "0");
            var recorded = await _financing.RecordDisbursementAsync(adminId, request);
            return Ok(recorded);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("documents/{id:int}/content")]
    public async Task<IActionResult> GetDocumentContent(int id)
    {
        try
        {
            var content = await _financing.GetSupportingDocumentContentAsync(id);
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Country")
            {
                int callerCountryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
                if (content.OwnerCountryId != callerCountryId) return Forbid();
            }
            return File(content.Bytes, content.ContentType, content.FileName);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("disbursements")]
    public async Task<ActionResult<List<DisbursementDto>>> GetDisbursements([FromQuery] int? projectId = null)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Country")
        {
            int callerCountryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
            return Ok(await _financing.GetDisbursementsAsync(callerCountryId, projectId));
        }

        return Ok(await _financing.GetDisbursementsAsync(null, projectId));
    }
}
