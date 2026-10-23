using Loanly.Api.Data;
using Loanly.Api.Dtos;
using Loanly.Api.Models;
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
    private readonly FinancingService _financing;

    public PublicDataController(WorldBankService wb, LoanlyDbContext db, FinancingService financing)
    {
        _wb = wb;
        _db = db;
        _financing = financing;
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
            .Include(p => p.Country)
            .Include(p => p.ResultsIndicators)
            .Where(p => p.Country!.IsoAlpha3 == iso)
            .OrderByDescending(p => p.BoardApprovalDate)
            .ToListAsync();

        return Ok(projects.Select(MapToPublicSummary).ToList());
    }

    [HttpGet("success-stories")]
    public async Task<ActionResult<List<PublicProjectSummaryDto>>> GetSuccessStories()
    {
        var projects = await _db.Projects
            .Include(p => p.Country)
            .Include(p => p.ResultsIndicators)
            .Where(p => p.Status == ProjectStatus.Active)
            .ToListAsync();

        var stories = projects
            .Select(MapToPublicSummary)
            .OrderByDescending(p => p.TopIndicator?.ProgressPercent ?? 0)
            .Take(6)
            .ToList();

        return Ok(stories);
    }

    private static PublicProjectSummaryDto MapToPublicSummary(Project p)
    {
        PublicIndicatorHighlightDto? top = null;
        if (p.ResultsIndicators.Count > 0)
        {
            var best = p.ResultsIndicators
                .Select(r =>
                {
                    var span = r.TargetValue - r.BaselineValue;
                    var progress = span != 0m
                        ? Math.Round(Math.Clamp(((r.CurrentValue - r.BaselineValue) / span) * 100m, 0m, 100m), 1)
                        : (r.CurrentValue >= r.TargetValue ? 100m : 0m);
                    return (r.IndicatorName, r.Unit, r.CurrentValue, r.TargetValue, Progress: progress);
                })
                .OrderByDescending(x => x.Progress)
                .First();

            top = new PublicIndicatorHighlightDto(best.IndicatorName, best.Unit, best.CurrentValue, best.TargetValue, best.Progress);
        }

        return new PublicProjectSummaryDto(
            p.ProjectCode,
            p.Title,
            p.Country?.Name ?? string.Empty,
            p.Country?.IsoAlpha3 ?? string.Empty,
            p.Sector,
            p.FinancingInstrument,
            p.ApprovedAmount,
            p.Status,
            p.ProjectDevelopmentObjective,
            top
        );
    }

    [HttpGet("impact-summary")]
    public async Task<ActionResult<PublicImpactSummaryDto>> GetImpactSummary()
    {
        var analytics = await _financing.GetPortfolioAnalyticsAsync();
        var countriesServed = await _db.Projects.Select(p => p.CountryId).Distinct().CountAsync();

        return Ok(new PublicImpactSummaryDto(
            countriesServed,
            analytics.TotalCommitted,
            analytics.TotalDisbursed,
            analytics.TotalProjectsCount,
            analytics.ActiveProjectsCount,
            analytics.BySector,
            analytics.ByRegion,
            analytics.ByInstrument
        ));
    }
}
