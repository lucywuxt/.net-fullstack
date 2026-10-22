using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    public async Task<WithdrawalApplicationDto> ReviewWithdrawalApplicationAsync(
        int withdrawalId,
        int adminId,
        ReviewWithdrawalApplicationRequestDto request)
    {
        var application = await _db.WithdrawalApplications
            .Include(w => w.Project).ThenInclude(p => p!.Country)
            .Include(w => w.Project).ThenInclude(p => p!.WithdrawalApplications).ThenInclude(wa => wa.Disbursement)
            .Include(w => w.Disbursement)
            .FirstOrDefaultAsync(w => w.Id == withdrawalId)
            ?? throw new ServiceValidationException($"Withdrawal Application with ID {withdrawalId} was not found.");

        if (application.Status == WithdrawalStatus.Disbursed)
            throw new ServiceValidationException("Cannot modify a Withdrawal Application that has already been disbursed.");

        if (request.DecisionStatus != WithdrawalStatus.UnderReview &&
            request.DecisionStatus != WithdrawalStatus.Approved &&
            request.DecisionStatus != WithdrawalStatus.Rejected)
        {
            throw new ServiceValidationException("Review status must be UnderReview, Approved, or Rejected.");
        }

        var project = application.Project!;

        if (request.DecisionStatus == WithdrawalStatus.Approved)
        {
            if (project.Status != ProjectStatus.Active)
                throw new ServiceValidationException("Cannot approve a Withdrawal Application for a project that is not Active.");

            var totalDisbursed = GetTotalDisbursed(project);
            var otherApprovedPending = project.WithdrawalApplications
                .Where(w => w.Id != application.Id && w.Status == WithdrawalStatus.Approved && w.Disbursement == null)
                .Sum(w => w.AmountRequested);

            var remainingUndisbursed = project.ApprovedAmount - totalDisbursed;
            var availableForApproval = remainingUndisbursed - otherApprovedPending;

            if (application.AmountRequested > remainingUndisbursed)
                throw new ServiceValidationException(
                    $"Cannot approve Withdrawal Application: requested amount (${application.AmountRequested:N2}) exceeds the project's remaining undisbursed ApprovedAmount (${remainingUndisbursed:N2}).");

            if (application.AmountRequested > availableForApproval)
                throw new ServiceValidationException(
                    $"Cannot approve Withdrawal Application: requested amount (${application.AmountRequested:N2}) plus other approved applications awaiting disbursement (${otherApprovedPending:N2}) would exceed the remaining undisbursed ApprovedAmount (${remainingUndisbursed:N2}).");
        }

        application.Status = request.DecisionStatus;
        application.ReviewedAt = DateTime.UtcNow;
        application.ReviewedByAdminId = adminId;
        application.ReviewNotes = string.IsNullOrWhiteSpace(request.ReviewNotes) ? null : request.ReviewNotes.Trim();

        await _db.SaveChangesAsync();

        var admin = await _db.Admins.FindAsync(adminId);
        var noteSuffix = string.IsNullOrWhiteSpace(request.ReviewNotes) ? "" : $" Note: {request.ReviewNotes.Trim()}";
        await LogAuditAsync(
            "WithdrawalApplication", application.Id, "StatusChanged",
            $"{application.ApplicationNumber} marked {request.DecisionStatus} by {admin?.Name ?? "Admin"}.{noteSuffix}",
            admin?.Name ?? "Admin", admin?.Role.ToString() ?? "Admin", project.CountryId);

        var updated = await _db.WithdrawalApplications
            .Include(w => w.Project).ThenInclude(p => p!.Country)
            .Include(w => w.ReviewedByAdmin)
            .Include(w => w.Disbursement)
            .Include(w => w.SupportingDocuments)
            .FirstAsync(w => w.Id == application.Id);

        return MapWithdrawalToDto(updated);
    }
}
