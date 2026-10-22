using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    public async Task<ResultsIndicatorDto> UpsertResultsIndicatorAsync(UpsertResultsIndicatorRequestDto request)
    {
        var project = await _db.Projects.FindAsync(request.ProjectId)
            ?? throw new ServiceValidationException($"Project with ID {request.ProjectId} was not found.");

        if (string.IsNullOrWhiteSpace(request.IndicatorName))
            throw new ServiceValidationException("Indicator name is required.");

        ResultsIndicator indicator;
        if (request.Id.HasValue && request.Id.Value > 0)
        {
            indicator = await _db.ResultsIndicators
                .FirstOrDefaultAsync(r => r.Id == request.Id.Value && r.ProjectId == project.Id)
                ?? throw new ServiceValidationException("Results Indicator was not found for this project.");

            indicator.IndicatorName = request.IndicatorName.Trim();
            indicator.Unit = request.Unit.Trim();
            indicator.BaselineValue = decimal.Round(request.BaselineValue, 2);
            indicator.TargetValue = decimal.Round(request.TargetValue, 2);
            indicator.CurrentValue = decimal.Round(request.CurrentValue, 2);
            indicator.MeasuredAt = DateTime.UtcNow;
        }
        else
        {
            indicator = new ResultsIndicator
            {
                ProjectId = project.Id,
                IndicatorName = request.IndicatorName.Trim(),
                Unit = string.IsNullOrWhiteSpace(request.Unit) ? "units" : request.Unit.Trim(),
                BaselineValue = decimal.Round(request.BaselineValue, 2),
                TargetValue = decimal.Round(request.TargetValue, 2),
                CurrentValue = decimal.Round(request.CurrentValue, 2),
                MeasuredAt = DateTime.UtcNow
            };
            _db.ResultsIndicators.Add(indicator);
        }

        await _db.SaveChangesAsync();
        return MapIndicatorToDto(indicator);
    }

    public async Task<PortfolioAnalyticsDto> GetPortfolioAnalyticsAsync()
    {
        var projects = await _db.Projects
            .Include(p => p.Country)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
            .ToListAsync();

        var totalCommitted = projects.Sum(p => p.ApprovedAmount);
        var totalDisbursed = projects
            .SelectMany(p => p.WithdrawalApplications)
            .Where(w => w.Disbursement != null)
            .Sum(w => w.Disbursement!.AmountDisbursed);
        var totalUndisbursed = totalCommitted - totalDisbursed;
        var disbursementRate = totalCommitted > 0
            ? decimal.Round((totalDisbursed / totalCommitted) * 100m, 1)
            : 0m;

        var pendingWithdrawals = projects
            .SelectMany(p => p.WithdrawalApplications)
            .Where(w => w.Status == WithdrawalStatus.Submitted || w.Status == WithdrawalStatus.UnderReview || w.Status == WithdrawalStatus.Approved)
            .ToList();

        BreakdownItemDto MapGroup(string key, IEnumerable<Project> group) => new(
            key,
            group.Count(),
            group.Sum(p => p.ApprovedAmount),
            group.SelectMany(p => p.WithdrawalApplications).Where(w => w.Disbursement != null).Sum(w => w.Disbursement!.AmountDisbursed)
        );

        return new PortfolioAnalyticsDto(
            totalCommitted,
            totalDisbursed,
            totalUndisbursed,
            disbursementRate,
            projects.Count,
            projects.Count(p => p.Status == ProjectStatus.Active),
            pendingWithdrawals.Count,
            pendingWithdrawals.Sum(w => w.AmountRequested),
            projects.GroupBy(p => p.Sector.ToString()).Select(g => MapGroup(g.Key, g)).OrderByDescending(b => b.CommittedAmount).ToList(),
            projects.GroupBy(p => p.Country?.Region ?? "Other").Select(g => MapGroup(g.Key, g)).OrderByDescending(b => b.CommittedAmount).ToList(),
            projects.GroupBy(p => p.FinancingInstrument.ToString()).Select(g => MapGroup(g.Key, g)).OrderByDescending(b => b.CommittedAmount).ToList(),
            projects.GroupBy(p => p.Status.ToString()).Select(g => MapGroup(g.Key, g)).ToList()
        );
    }
}
