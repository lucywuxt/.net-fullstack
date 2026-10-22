using Loanly.Api.Dtos;
using Microsoft.Extensions.Caching.Memory;

namespace Loanly.Api.Services;

public partial class WorldBankService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<WorldBankService> _logger;

    public static readonly List<IndicatorOptionDto> SupportedIndicators = new()
    {
        new("NY.GDP.PCAP.CD", "GDP per Capita (Current US$)", "USD", "Gross domestic product divided by midyear population in current US dollars.", "emerald"),
        new("EG.ELC.ACCS.ZS", "Access to Electricity (% of Population)", "%", "Percentage of population with access to reliable household electricity.", "amber"),
        new("SP.DYN.LE00.IN", "Life Expectancy at Birth (Years)", "years", "Average number of years a newborn infant would live under prevailing patterns.", "cyan"),
        new("SI.POV.DDAY", "Poverty Headcount Ratio ($2.15/day, % of Pop)", "%", "Percentage of population living on less than $2.15/day (2017 PPP).", "rose"),
        new("EN.GHG.CO2.PC.CE.AR5", "CO2 Emissions per Capita (t CO2e/capita)", "t CO2e", "Carbon dioxide emissions per capita excluding LULUCF.", "violet")
    };

    private static readonly HashSet<string> AggregateIso3Codes = new(StringComparer.OrdinalIgnoreCase)
    {
        "AFE", "AFW", "ARB", "CEB", "CSS", "EAP", "EAR", "EAS", "ECA", "ECS", "EMU", "EUU",
        "FCS", "HIC", "HPC", "IBD", "IBT", "IDA", "IDB", "IDX", "INX", "LAC", "LCN", "LDC",
        "LIC", "LMC", "LMY", "LTE", "MEA", "MIC", "MNA", "NAC", "OED", "OSS", "PRE", "PSS",
        "PST", "SAS", "SSA", "SSF", "SST", "TEA", "TEC", "TLA", "TMN", "TSA", "TSS", "UMC", "WLD"
    };

    public WorldBankService(HttpClient httpClient, IMemoryCache cache, ILogger<WorldBankService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public List<IndicatorOptionDto> GetIndicators() => SupportedIndicators;

    public async Task<GlobalIndicatorDatasetDto> GetGlobalIndicatorDatasetAsync(string indicatorCode)
    {
        var meta = SupportedIndicators.FirstOrDefault(i => i.Code.Equals(indicatorCode, StringComparison.OrdinalIgnoreCase))
            ?? SupportedIndicators[0];

        string cacheKey = $"wb:global:{meta.Code}";
        if (_cache.TryGetValue(cacheKey, out GlobalIndicatorDatasetDto? cached) && cached != null)
            return cached;

        var dataPoints = new List<CountryYearValueDto>();
        try
        {
            var url = $"https://api.worldbank.org/v2/country/all/indicator/{Uri.EscapeDataString(meta.Code)}?format=json&date=2010:2023&per_page=5000";
            using var response = await _httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                var rawJson = await response.Content.ReadAsStringAsync();
                dataPoints = ParseWorldBankGlobalArray(rawJson);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "World Bank global fetch failed for {Indicator}; using fallback baseline.", meta.Code);
        }

        if (dataPoints.Count == 0)
            dataPoints = BuildFallbackGlobalDataset(meta.Code);

        var years = dataPoints.Select(d => d.Year).Distinct().OrderBy(y => y).ToList();
        int minYear = years.Count > 0 ? years.First() : 2010;
        int maxYear = years.Count > 0 ? years.Last() : 2023;

        var dataset = new GlobalIndicatorDatasetDto(
            meta.Code, meta.Name, meta.Unit, minYear, maxYear,
            BuildGlobalHighlights(meta, dataPoints, maxYear), dataPoints);

        _cache.Set(cacheKey, dataset, TimeSpan.FromHours(12));
        return dataset;
    }

    public async Task<CountryIndicatorSeriesDto> GetCountryIndicatorSeriesAsync(string countryCode, string indicatorCode)
    {
        var cleanCountry = countryCode.Trim().ToUpperInvariant();
        var meta = SupportedIndicators.FirstOrDefault(i => i.Code.Equals(indicatorCode, StringComparison.OrdinalIgnoreCase))
            ?? SupportedIndicators[0];

        string cacheKey = $"wb:country:{cleanCountry}:{meta.Code}";
        if (_cache.TryGetValue(cacheKey, out CountryIndicatorSeriesDto? cached) && cached != null)
            return cached;

        CountryIndicatorSeriesDto? parsed = null;
        try
        {
            var url = $"https://api.worldbank.org/v2/country/{Uri.EscapeDataString(cleanCountry)}/indicator/{Uri.EscapeDataString(meta.Code)}?format=json&date=2000:2024&per_page=100";
            using var response = await _httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                var rawJson = await response.Content.ReadAsStringAsync();
                parsed = ParseWorldBankCountrySeries(rawJson, cleanCountry, meta);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "World Bank country fetch failed for {Country}/{Indicator}", cleanCountry, meta.Code);
        }

        if (parsed == null || parsed.Series.All(s => s.Value == null))
        {
            var globalData = await GetGlobalIndicatorDatasetAsync(meta.Code);
            var rows = globalData.DataPoints.Where(d => d.CountryIso3.Equals(cleanCountry, StringComparison.OrdinalIgnoreCase)).OrderBy(d => d.Year).ToList();
            var name = rows.FirstOrDefault()?.CountryName ?? cleanCountry;
            var pts = rows.Select(r => new YearPointDto(r.Year, r.Value)).ToList();
            var latest = pts.LastOrDefault(p => p.Value != null);
            parsed = new CountryIndicatorSeriesDto(cleanCountry, name, meta.Code, meta.Name, meta.Unit, latest?.Value, latest?.Year, pts);
        }

        _cache.Set(cacheKey, parsed, TimeSpan.FromHours(12));
        return parsed;
    }
}
