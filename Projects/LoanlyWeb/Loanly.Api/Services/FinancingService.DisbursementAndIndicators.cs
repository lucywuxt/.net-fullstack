using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    public async Task<DisbursementDto> RecordDisbursementAsync(
        int adminId,
        RecordDisbursementRequestDto request)
    {
        var application = await _db.WithdrawalApplications
            .Include(w => w.Project).ThenInclude(p => p!.Country)
            .Include(w => w.Project).ThenInclude(p => p!.WithdrawalApplications).ThenInclude(wa => wa.Disbursement)
            .Include(w => w.Disbursement)
            .FirstOrDefaultAsync(w => w.Id == request.WithdrawalApplicationId)
            ?? throw new ServiceValidationException("Withdrawal Application was not found.");

        if (application.Disbursement != null || application.Status == WithdrawalStatus.Disbursed)
            throw new ServiceValidationException("A disbursement has already been recorded for this Withdrawal Application.");

        if (application.Status != WithdrawalStatus.Approved)
            throw new ServiceValidationException(
                $"Disbursements can only be recorded against Approved Withdrawal Applications. Current status is '{application.Status}'.");

        if (request.AmountDisbursed <= 0)
            throw new ServiceValidationException("Disbursed amount must be greater than zero.");

        if (request.AmountDisbursed > application.AmountRequested)
            throw new ServiceValidationException(
                $"Disbursed amount (${request.AmountDisbursed:N2}) cannot exceed the approved Withdrawal Application amount (${application.AmountRequested:N2}).");

        var project = application.Project!;
        var totalDisbursedSoFar = GetTotalDisbursed(project);
        var remainingBefore = project.ApprovedAmount - totalDisbursedSoFar;

        if (request.AmountDisbursed > remainingBefore)
            throw new ServiceValidationException(
                $"Disbursement (${request.AmountDisbursed:N2}) would exceed the project's remaining undisbursed ApprovedAmount (${remainingBefore:N2}).");

        var remainingCeilingAfter = remainingBefore - decimal.Round(request.AmountDisbursed, 2);
        var txRef = string.IsNullOrWhiteSpace(request.TransactionReference)
            ? $"IBRD-DISB-{DateTime.UtcNow:yyyyMMdd}-{application.Id:D4}"
            : request.TransactionReference.Trim();

        var disbursement = new Disbursement
        {
            WithdrawalApplicationId = application.Id,
            AmountDisbursed = decimal.Round(request.AmountDisbursed, 2),
            DesignatedAccountBalanceAfter = remainingCeilingAfter,
            DisbursedAt = DateTime.UtcNow,
            TransactionReference = txRef
        };

        application.Status = WithdrawalStatus.Disbursed;
        if (application.ReviewedByAdminId == null)
        {
            application.ReviewedByAdminId = adminId;
            application.ReviewedAt = DateTime.UtcNow;
        }

        _db.Disbursements.Add(disbursement);
        await _db.SaveChangesAsync();

        var admin = await _db.Admins.FindAsync(adminId);
        await LogAuditAsync(
            "WithdrawalApplication", application.Id, "Disbursed",
            $"{application.ApplicationNumber} disbursed ${disbursement.AmountDisbursed:N0} (ref {disbursement.TransactionReference}) by {admin?.Name ?? "Admin"}.",
            admin?.Name ?? "Admin", admin?.Role.ToString() ?? "Admin", project.CountryId);

        return new DisbursementDto(
            disbursement.Id,
            application.Id,
            application.ApplicationNumber,
            project.Id,
            project.ProjectCode,
            project.Title,
            project.Country?.Name ?? string.Empty,
            application.Category,
            disbursement.AmountDisbursed,
            disbursement.DesignatedAccountBalanceAfter,
            disbursement.DisbursedAt,
            disbursement.TransactionReference
        );
    }

    public async Task<List<WithdrawalApplicationDto>> GetWithdrawalApplicationsAsync(int? countryId = null)
    {
        var query = _db.WithdrawalApplications
            .Include(w => w.Project).ThenInclude(p => p!.Country)
            .Include(w => w.ReviewedByAdmin)
            .Include(w => w.Disbursement)
            .Include(w => w.SupportingDocuments)
            .AsQueryable();

        if (countryId.HasValue)
            query = query.Where(w => w.Project!.CountryId == countryId.Value);

        var list = await query.OrderByDescending(w => w.SubmittedAt).ToListAsync();
        return list.Select(MapWithdrawalToDto).ToList();
    }

    public async Task<List<DisbursementDto>> GetDisbursementsAsync(int? countryId = null, int? projectId = null)
    {
        var query = _db.Disbursements
            .Include(d => d.WithdrawalApplication).ThenInclude(w => w!.Project).ThenInclude(p => p!.Country)
            .AsQueryable();

        if (countryId.HasValue)
            query = query.Where(d => d.WithdrawalApplication!.Project!.CountryId == countryId.Value);

        if (projectId.HasValue)
            query = query.Where(d => d.WithdrawalApplication!.ProjectId == projectId.Value);

        var list = await query.OrderByDescending(d => d.DisbursedAt).ThenByDescending(d => d.Id).ToListAsync();

        return list.Select(d => new DisbursementDto(
            d.Id,
            d.WithdrawalApplicationId,
            d.WithdrawalApplication!.ApplicationNumber,
            d.WithdrawalApplication.ProjectId,
            d.WithdrawalApplication.Project!.ProjectCode,
            d.WithdrawalApplication.Project.Title,
            d.WithdrawalApplication.Project.Country?.Name ?? string.Empty,
            d.WithdrawalApplication.Category,
            d.AmountDisbursed,
            d.DesignatedAccountBalanceAfter,
            d.DisbursedAt,
            d.TransactionReference
        )).ToList();
    }
}
