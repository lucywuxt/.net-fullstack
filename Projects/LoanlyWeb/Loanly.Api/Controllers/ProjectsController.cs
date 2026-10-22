using System.Security.Claims;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly FinancingService _financing;

    public ProjectsController(FinancingService financing)
    {
        _financing = financing;
    }

    [HttpGet("countries")]
    public async Task<ActionResult<List<CountrySummaryDto>>> GetCountries()
    {
        return Ok(await _financing.GetCountriesAsync());
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects([FromQuery] int? countryId = null)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Country")
        {
            int callerCountryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
            return Ok(await _financing.GetProjectsAsync(callerCountryId));
        }

        return Ok(await _financing.GetProjectsAsync(countryId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var project = await _financing.GetProjectByIdAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Country")
        {
            int callerCountryId = int.Parse(User.FindFirstValue("countryId") ?? "0");
            if (project.CountryId != callerCountryId) return Forbid();
        }

        return Ok(project);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectRequestDto request)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue("adminId") ?? "0");
            var created = await _financing.CreateProjectAsync(adminId, request);
            return CreatedAtAction(nameof(GetProject), new { id = created.Id }, created);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectDto>> UpdateStatus(int id, [FromBody] UpdateProjectStatusRequestDto request)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue("adminId") ?? "0");
            var updated = await _financing.UpdateProjectStatusAsync(adminId, id, request.NewStatus);
            return Ok(updated);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/indicators")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ResultsIndicatorDto>> UpsertIndicator(int id, [FromBody] UpsertResultsIndicatorRequestDto request)
    {
        try
        {
            var dto = await _financing.UpsertResultsIndicatorAsync(request with { ProjectId = id });
            return Ok(dto);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("portfolio-analytics")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PortfolioAnalyticsDto>> GetPortfolioAnalytics()
    {
        return Ok(await _financing.GetPortfolioAnalyticsAsync());
    }
}
