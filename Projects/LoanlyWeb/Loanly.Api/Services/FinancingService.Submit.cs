using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    public async Task<WithdrawalApplicationDto> SubmitWithdrawalApplicationAsync(
        int countryId,
        CreateWithdrawalApplicationRequestDto request)
    {
        if (request.AmountRequested <= 0)
            throw new ServiceValidationException("Withdrawal Application amount must be greater than zero.");

        if (string.IsNullOrWhiteSpace(request.SupportingDocumentsNote))
            throw new ServiceValidationException("Supporting documents reference / note is required for World Bank disbursement controls.");

        var project = await _db.Projects
            .Include(p => p.Country)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId)
            ?? throw new ServiceValidationException("Specified project does not exist.");

        if (project.CountryId != countryId)
            throw new ServiceValidationException("You may only submit Withdrawal Applications for your own country's projects.");

        if (project.Status != ProjectStatus.Active)
            throw new ServiceValidationException(
                $"Withdrawal Applications can only be submitted against Active projects. Current project status is '{project.Status}'.");

        var totalDisbursed = GetTotalDisbursed(project);
        var approvedPending = GetApprovedPendingDisbursement(project);
        var remainingUndisbursed = project.ApprovedAmount - totalDisbursed;
        var availableCeiling = remainingUndisbursed - approvedPending;

        if (request.AmountRequested > remainingUndisbursed)
            throw new ServiceValidationException(
                $"Requested amount (${request.AmountRequested:N2}) exceeds the project's remaining undisbursed financing ceiling (${remainingUndisbursed:N2}).");

        if (request.AmountRequested > availableCeiling)
            throw new ServiceValidationException(
                $"Requested amount (${request.AmountRequested:N2}) exceeds the uncommitted balance (${availableCeiling:N2}) after accounting for already-approved Withdrawal Applications (${approvedPending:N2}).");

        int count = await _db.WithdrawalApplications.CountAsync() + 101;
        var application = new WithdrawalApplication
        {
            ApplicationNumber = $"WA-{DateTime.UtcNow.Year}-{count:D4}",
            ProjectId = project.Id,
            Category = request.Category,
            AmountRequested = decimal.Round(request.AmountRequested, 2),
            SupportingDocumentsNote = request.SupportingDocumentsNote.Trim(),
            Status = WithdrawalStatus.Submitted,
            SubmittedAt = DateTime.UtcNow
        };

        _db.WithdrawalApplications.Add(application);
        await _db.SaveChangesAsync();

        var reloaded = await _db.WithdrawalApplications
            .Include(w => w.Project).ThenInclude(p => p!.Country)
            .Include(w => w.ReviewedByAdmin)
            .Include(w => w.Disbursement)
            .FirstAsync(w => w.Id == application.Id);

        return MapWithdrawalToDto(reloaded);
    }
}
