using Loanly.Api.Data;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/public/worldbank")]
public class PublicDataController : ControllerBase
{
    private readonly WorldBankService _wb;
    private readonly LoanlyDbContext _db;

    public PublicDataController(WorldBankService wb, LoanlyDbContext db)
    {
        _wb = wb;
        _db = db;
    }

    [HttpGet("indicators")]
    public ActionResult<List<IndicatorOptionDto>> GetIndicators()
    {
        return Ok(_wb.GetIndicators());
    }

    [HttpGet("global/{indicatorCode}")]
    public async Task<ActionResult<GlobalIndicatorDatasetDto>> GetGlobalIndicator(string indicatorCode)
    {
        var dataset = await _wb.GetGlobalIndicatorDatasetAsync(indicatorCode);
        return Ok(dataset);
    }

    [HttpGet("country/{countryCode}/indicator/{indicatorCode}")]
    public async Task<ActionResult<CountryIndicatorSeriesDto>> GetCountryIndicatorSeries(
        string countryCode,
        string indicatorCode)
    {
        var series = await _wb.GetCountryIndicatorSeriesAsync(countryCode, indicatorCode);
        return Ok(series);
    }

    [HttpGet("country/{countryIso3}/projects")]
    public async Task<ActionResult<List<PublicProjectSummaryDto>>> GetPublicProjects(string countryIso3)
    {
        var iso = countryIso3.Trim().ToUpperInvariant();
        var projects = await _db.Projects
            .Where(p => p.Country!.IsoAlpha3 == iso)
            .OrderByDescending(p => p.BoardApprovalDate)
            .Select(p => new PublicProjectSummaryDto(
                p.ProjectCode,
                p.Title,
                p.Sector,
                p.FinancingInstrument,
                p.ApprovedAmount,
                p.Status))
            .ToListAsync();

        return Ok(projects);
    }
}
