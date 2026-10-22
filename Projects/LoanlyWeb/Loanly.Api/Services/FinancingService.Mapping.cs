using Loanly.Api.Dtos;
using Loanly.Api.Models;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    public static decimal GetTotalDisbursed(Project project) =>
        project.WithdrawalApplications.Where(w => w.Disbursement != null).Sum(w => w.Disbursement!.AmountDisbursed);

    public static decimal GetApprovedPendingDisbursement(Project project) =>
        project.WithdrawalApplications.Where(w => w.Status == WithdrawalStatus.Approved && w.Disbursement == null).Sum(w => w.AmountRequested);

    private static ProjectDto MapProjectToDto(Project project)
    {
        var totalDisbursed = GetTotalDisbursed(project);
        var approvedPending = GetApprovedPendingDisbursement(project);
        var remainingUndisbursed = project.ApprovedAmount - totalDisbursed;
        var availableToRequest = Math.Max(0m, remainingUndisbursed - approvedPending);

        return new ProjectDto(
            project.Id, project.ProjectCode, project.Title, project.CountryId,
            project.Country?.Name ?? string.Empty, project.Country?.IsoAlpha3 ?? string.Empty, project.Country?.Region ?? string.Empty,
            project.Sector, project.FinancingInstrument, project.ApprovedAmount,
            totalDisbursed, approvedPending, remainingUndisbursed, availableToRequest,
            project.Status, project.BoardApprovalDate, project.ClosingDate, project.ProjectDevelopmentObjective,
            project.ResultsIndicators.OrderBy(r => r.Id).Select(MapIndicatorToDto).ToList(),
            project.WithdrawalApplications.OrderByDescending(w => w.SubmittedAt).Select(MapWithdrawalToDto).ToList()
        );
    }

    private static WithdrawalApplicationDto MapWithdrawalToDto(WithdrawalApplication w) => new(
        w.Id, w.ApplicationNumber, w.ProjectId, w.Project?.ProjectCode ?? string.Empty, w.Project?.Title ?? string.Empty,
        w.Project?.CountryId ?? 0, w.Project?.Country?.Name ?? string.Empty,
        w.Category, w.AmountRequested, w.SupportingDocumentsNote, w.Status,
        w.SubmittedAt, w.ReviewedAt, w.ReviewedByAdminId, w.ReviewedByAdmin?.Name, w.ReviewNotes,
        w.Disbursement == null ? null : new DisbursementDto(
            w.Disbursement.Id, w.Id, w.ApplicationNumber, w.ProjectId,
            w.Project?.ProjectCode ?? string.Empty, w.Project?.Title ?? string.Empty, w.Project?.Country?.Name ?? string.Empty,
            w.Category, w.Disbursement.AmountDisbursed, w.Disbursement.DesignatedAccountBalanceAfter,
            w.Disbursement.DisbursedAt, w.Disbursement.TransactionReference),
        w.SupportingDocuments.OrderBy(d => d.Id).Select(MapDocumentToDto).ToList()
    );

    private static SupportingDocumentDto MapDocumentToDto(SupportingDocument d) => new(
        d.Id, d.FileName, d.FileSizeBytes, d.DocumentType, d.UploadedAt
    );

    private static AuditLogEntryDto MapAuditLogToDto(AuditLogEntry a) => new(
        a.Id, a.EntityType, a.EntityId, a.Action, a.Summary, a.PerformedByName, a.PerformedByRole, a.CreatedAt
    );

    private static ResultsIndicatorDto MapIndicatorToDto(ResultsIndicator r)
    {
        var span = r.TargetValue - r.BaselineValue;
        decimal progress = span != 0m
            ? decimal.Round(Math.Clamp(((r.CurrentValue - r.BaselineValue) / span) * 100m, 0m, 100m), 1)
            : (r.CurrentValue >= r.TargetValue ? 100m : 0m);

        return new ResultsIndicatorDto(r.Id, r.ProjectId, r.IndicatorName, r.Unit, r.BaselineValue, r.TargetValue, r.CurrentValue, progress, r.MeasuredAt);
    }
}
