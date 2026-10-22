using System.Text.Json;
using Loanly.Api.Dtos;

namespace Loanly.Api.Services;

public partial class WorldBankService
{
    public static List<CountryYearValueDto> ParseWorldBankGlobalArray(string rawJson)
    {
        var results = new List<CountryYearValueDto>();
        if (string.IsNullOrWhiteSpace(rawJson)) return results;

        using var doc = JsonDocument.Parse(rawJson);
        if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() < 2)
            return results;

        var rowsElement = doc.RootElement[1];
        if (rowsElement.ValueKind != JsonValueKind.Array)
            return results;

        foreach (var item in rowsElement.EnumerateArray())
        {
            var iso3 = item.TryGetProperty("countryiso3code", out var isoProp) && isoProp.ValueKind == JsonValueKind.String
                ? isoProp.GetString()?.Trim().ToUpperInvariant()
                : null;

            if (string.IsNullOrEmpty(iso3) || iso3.Length != 3 || AggregateIso3Codes.Contains(iso3))
                continue;

            var dateStr = item.TryGetProperty("date", out var dateProp) && dateProp.ValueKind == JsonValueKind.String
                ? dateProp.GetString() : null;

            if (!int.TryParse(dateStr, out int year))
                continue;

            string countryName = iso3;
            if (item.TryGetProperty("country", out var cObj) && cObj.ValueKind == JsonValueKind.Object &&
                cObj.TryGetProperty("value", out var nameProp) && nameProp.ValueKind == JsonValueKind.String)
            {
                countryName = nameProp.GetString() ?? iso3;
            }

            if (item.TryGetProperty("value", out var valProp) && valProp.ValueKind == JsonValueKind.Number)
            {
                double val = Math.Round(valProp.GetDouble(), 2);
                results.Add(new CountryYearValueDto(iso3, countryName, "Member Economy", year, val));
            }
        }

        return results;
    }

    public static CountryIndicatorSeriesDto? ParseWorldBankCountrySeries(
        string rawJson,
        string fallbackIso3,
        IndicatorOptionDto meta)
    {
        if (string.IsNullOrWhiteSpace(rawJson)) return null;

        using var doc = JsonDocument.Parse(rawJson);
        if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() < 2)
            return null;

        var rowsElement = doc.RootElement[1];
        if (rowsElement.ValueKind != JsonValueKind.Array)
            return null;

        string resolvedName = fallbackIso3;
        string resolvedIso3 = fallbackIso3;
        var points = new List<YearPointDto>();

        foreach (var item in rowsElement.EnumerateArray())
        {
            if (item.TryGetProperty("countryiso3code", out var isoProp) && isoProp.ValueKind == JsonValueKind.String)
            {
                var code = isoProp.GetString();
                if (!string.IsNullOrWhiteSpace(code)) resolvedIso3 = code.Trim().ToUpperInvariant();
            }

            if (item.TryGetProperty("country", out var cObj) && cObj.ValueKind == JsonValueKind.Object &&
                cObj.TryGetProperty("value", out var nameProp) && nameProp.ValueKind == JsonValueKind.String)
            {
                resolvedName = nameProp.GetString() ?? resolvedName;
            }

            var dateStr = item.TryGetProperty("date", out var dateProp) && dateProp.ValueKind == JsonValueKind.String
                ? dateProp.GetString() : null;

            if (!int.TryParse(dateStr, out int year)) continue;

            double? val = null;
            if (item.TryGetProperty("value", out var valProp) && valProp.ValueKind == JsonValueKind.Number)
                val = Math.Round(valProp.GetDouble(), 2);

            points.Add(new YearPointDto(year, val));
        }

        var ordered = points.OrderBy(p => p.Year).ToList();
        var latest = ordered.LastOrDefault(p => p.Value.HasValue);

        return new CountryIndicatorSeriesDto(
            resolvedIso3, resolvedName, meta.Code, meta.Name, meta.Unit,
            latest?.Value, latest?.Year, ordered);
    }
}
