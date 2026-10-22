using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/public/worldbank")]
public class PublicDataController : ControllerBase
{
    private readonly WorldBankService _wb;

    public PublicDataController(WorldBankService wb)
    {
        _wb = wb;
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
}
