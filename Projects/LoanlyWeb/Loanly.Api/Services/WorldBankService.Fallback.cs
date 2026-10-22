using Loanly.Api.Dtos;

namespace Loanly.Api.Services;

public partial class WorldBankService
{
    private static List<GlobalHighlightStatDto> BuildGlobalHighlights(
        IndicatorOptionDto meta,
        List<CountryYearValueDto> dataPoints,
        int targetYear)
    {
        var yearPoints = dataPoints.Where(d => d.Year == targetYear && d.Value.HasValue).ToList();
        if (yearPoints.Count == 0)
        {
            yearPoints = dataPoints.Where(d => d.Value.HasValue)
                .GroupBy(d => d.CountryIso3)
                .Select(g => g.OrderByDescending(x => x.Year).First())
                .ToList();
        }

        if (yearPoints.Count == 0) return new List<GlobalHighlightStatDto>();

        double avg = yearPoints.Average(p => p.Value!.Value);
        var highest = yearPoints.OrderByDescending(p => p.Value!.Value).First();
        var lowest = yearPoints.OrderBy(p => p.Value!.Value).First();

        string Fmt(double v) => meta.Unit == "USD" ? $"${v:N0}" : $"{v:N1} {meta.Unit}";

        return new List<GlobalHighlightStatDto>
        {
            new("Reporting Economies", $"{yearPoints.Count} Countries", $"World Bank Open Data ({targetYear})", "neutral"),
            new($"Global Mean ({meta.Unit})", Fmt(avg), $"Cross-country average for {meta.Name}", "up"),
            new("Highest Recorded", $"{highest.CountryName} ({Fmt(highest.Value!.Value)})", $"ISO-3: {highest.CountryIso3}", "up"),
            new("IDA / IBRD Focus Benchmark", $"{lowest.CountryName} ({Fmt(lowest.Value!.Value)})", $"Priority lending benchmark ({lowest.CountryIso3})", "down")
        };
    }

    private static List<CountryYearValueDto> BuildFallbackGlobalDataset(string indicatorCode)
    {
        var seeds = new (string Iso3, string Name, string Region, double Gdp, double Elec, double Life, double Pov, double Co2)[]
        {
            ("KEN", "Kenya", "Sub-Saharan Africa", 2099, 76.5, 63.1, 36.1, 0.42),
            ("IND", "India", "South Asia", 2484, 99.2, 67.7, 11.9, 1.98),
            ("BRA", "Brazil", "Latin America & Caribbean", 10296, 99.8, 73.4, 5.8, 2.21),
            ("VNM", "Viet Nam", "East Asia & Pacific", 4282, 99.8, 74.6, 1.0, 3.51),
            ("NGA", "Nigeria", "Sub-Saharan Africa", 1621, 60.5, 53.6, 38.9, 0.58),
            ("COL", "Colombia", "Latin America & Caribbean", 6979, 99.4, 73.7, 6.6, 1.84),
            ("USA", "United States", "North America", 81695, 100.0, 77.5, 0.2, 14.3),
            ("CHN", "China", "East Asia & Pacific", 12614, 100.0, 78.6, 0.1, 8.85),
            ("DEU", "Germany", "Europe & Central Asia", 52745, 100.0, 80.7, 0.1, 7.12),
            ("GBR", "United Kingdom", "Europe & Central Asia", 49463, 100.0, 82.1, 0.2, 4.72),
            ("FRA", "France", "Europe & Central Asia", 44460, 100.0, 82.5, 0.1, 4.25),
            ("JPN", "Japan", "East Asia & Pacific", 33834, 100.0, 84.0, 0.2, 8.51),
            ("ZAF", "South Africa", "Sub-Saharan Africa", 6253, 86.5, 61.5, 20.5, 6.74),
            ("EGY", "Egypt, Arab Rep.", "Middle East & North Africa", 3512, 100.0, 70.2, 1.5, 2.31),
            ("MEX", "Mexico", "Latin America & Caribbean", 13790, 99.5, 74.8, 2.1, 3.62),
            ("IDN", "Indonesia", "East Asia & Pacific", 4940, 99.4, 68.3, 2.5, 2.48),
            ("ETH", "Ethiopia", "Sub-Saharan Africa", 1293, 55.4, 65.6, 27.0, 0.18),
            ("GHA", "Ghana", "Sub-Saharan Africa", 2238, 86.6, 63.9, 25.2, 0.68),
            ("BGD", "Bangladesh", "South Asia", 2529, 99.0, 73.7, 9.6, 0.66),
            ("PAK", "Pakistan", "South Asia", 1407, 95.0, 66.4, 4.9, 0.87),
            ("PHL", "Philippines", "East Asia & Pacific", 3725, 97.5, 72.2, 3.0, 1.32),
            ("ARG", "Argentina", "Latin America & Caribbean", 13730, 100.0, 76.1, 1.1, 4.18),
            ("CHL", "Chile", "Latin America & Caribbean", 17093, 100.0, 79.5, 0.3, 4.42),
            ("PER", "Peru", "Latin America & Caribbean", 7789, 96.3, 73.4, 3.5, 1.72),
            ("MAR", "Morocco", "Middle East & North Africa", 3672, 100.0, 75.0, 0.8, 1.94),
            ("SEN", "Senegal", "Sub-Saharan Africa", 1746, 70.4, 67.9, 9.3, 0.69),
            ("TZA", "Tanzania", "Sub-Saharan Africa", 1211, 46.2, 66.8, 44.9, 0.24),
            ("UGA", "Uganda", "Sub-Saharan Africa", 1014, 47.1, 63.6, 42.2, 0.14),
            ("RWA", "Rwanda", "Sub-Saharan Africa", 1000, 62.5, 66.1, 47.0, 0.13),
            ("CAN", "Canada", "North America", 53371, 100.0, 81.3, 0.2, 14.9),
            ("AUS", "Australia", "East Asia & Pacific", 64711, 100.0, 83.2, 0.3, 14.8)
        };

        var list = new List<CountryYearValueDto>();
        for (int year = 2010; year <= 2023; year++)
        {
            double progress = (year - 2010) / 13.0;
            foreach (var c in seeds)
            {
                double val = indicatorCode switch
                {
                    "NY.GDP.PCAP.CD" => Math.Round(c.Gdp * (0.68 + 0.32 * progress), 1),
                    "EG.ELC.ACCS.ZS" => Math.Round(Math.Min(100.0, c.Elec * (0.76 + 0.24 * progress)), 1),
                    "SP.DYN.LE00.IN" => Math.Round(c.Life - 2.8 * (1.0 - progress), 1),
                    "SI.POV.DDAY" => Math.Round(Math.Max(0.1, c.Pov * (1.35 - 0.35 * progress)), 1),
                    _ => Math.Round(c.Co2 * (0.85 + 0.15 * progress), 2)
                };
                list.Add(new CountryYearValueDto(c.Iso3, c.Name, c.Region, year, val));
            }
        }
        return list;
    }
}
