using Loanly.Api.Data;
using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public class ServiceValidationException : Exception
{
    public ServiceValidationException(string message) : base(message) { }
}

public partial class FinancingService
{
    private readonly LoanlyDbContext _db;

    public FinancingService(LoanlyDbContext db)
    {
        _db = db;
    }

    public async Task<List<CountrySummaryDto>> GetCountriesAsync()
    {
        var countries = await _db.Countries
            .Include(c => c.Projects)
                .ThenInclude(p => p.WithdrawalApplications)
                    .ThenInclude(w => w.Disbursement)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return countries.Select(c =>
        {
            var activeCount = c.Projects.Count(p => p.Status == ProjectStatus.Active);
            var committed = c.Projects
                .Where(p => p.Status >= ProjectStatus.BoardApproval)
                .Sum(p => p.ApprovedAmount);
            var disbursed = c.Projects
                .SelectMany(p => p.WithdrawalApplications)
                .Where(w => w.Disbursement != null)
                .Sum(w => w.Disbursement!.AmountDisbursed);

            return new CountrySummaryDto(
                c.Id, c.Name, c.IsoAlpha3, c.Region, c.IncomeLevel, c.ContactEmail,
                activeCount, committed, disbursed);
        }).ToList();
    }

    public async Task<List<ProjectDto>> GetProjectsAsync(int? countryId = null)
    {
        var query = _db.Projects
            .Include(p => p.Country)
            .Include(p => p.ResultsIndicators)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.ReviewedByAdmin)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.SupportingDocuments)
            .AsQueryable();

        if (countryId.HasValue)
        {
            query = query.Where(p => p.CountryId == countryId.Value);
        }

        var projects = await query
            .OrderByDescending(p => p.Status == ProjectStatus.Active)
            .ThenByDescending(p => p.Id)
            .ToListAsync();

        return projects.Select(MapProjectToDto).ToList();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int projectId)
    {
        var project = await _db.Projects
            .Include(p => p.Country)
            .Include(p => p.ResultsIndicators)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.ReviewedByAdmin)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.SupportingDocuments)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        return project == null ? null : MapProjectToDto(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(int adminId, CreateProjectRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ServiceValidationException("Project title is required.");

        if (request.ApprovedAmount <= 0)
            throw new ServiceValidationException("Approved financing ceiling must be greater than zero.");

        var country = await _db.Countries.FindAsync(request.CountryId)
            ?? throw new ServiceValidationException($"Country with ID {request.CountryId} was not found.");

        int nextNumber = await _db.Projects.CountAsync() + 178410;
        var project = new Project
        {
            ProjectCode = $"P{nextNumber}",
            Title = request.Title.Trim(),
            CountryId = country.Id,
            Sector = request.Sector,
            FinancingInstrument = request.FinancingInstrument,
            ApprovedAmount = decimal.Round(request.ApprovedAmount, 2),
            Status = request.InitialStatus,
            BoardApprovalDate = request.InitialStatus >= ProjectStatus.BoardApproval ? DateTime.UtcNow : null,
            ClosingDate = request.ClosingDate ?? DateTime.UtcNow.AddYears(5),
            ProjectDevelopmentObjective = request.ProjectDevelopmentObjective.Trim()
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        var admin = await _db.Admins.FindAsync(adminId);
        await LogAuditAsync(
            "Project", project.Id, "Created",
            $"{project.ProjectCode} \"{project.Title}\" created for {country.Name} ({project.Sector}, ${project.ApprovedAmount:N0}).",
            admin?.Name ?? "Admin", admin?.Role.ToString() ?? "Admin", country.Id);

        return (await GetProjectByIdAsync(project.Id))!;
    }

    public async Task<ProjectDto> UpdateProjectStatusAsync(int adminId, int projectId, ProjectStatus newStatus)
    {
        var project = await _db.Projects
            .Include(p => p.WithdrawalApplications)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new ServiceValidationException($"Project with ID {projectId} was not found.");

        if (project.Status == ProjectStatus.Closed && newStatus != ProjectStatus.Closed)
            throw new ServiceValidationException("A closed project cannot be reopened to an earlier lifecycle stage.");

        if ((int)newStatus < (int)project.Status)
            throw new ServiceValidationException(
                $"Cannot move project backward in lifecycle from {project.Status} to {newStatus}. Lifecycle order is Concept → Appraisal → Negotiation → BoardApproval → Active → Closed.");

        if (newStatus == ProjectStatus.Closed)
        {
            bool hasPending = project.WithdrawalApplications.Any(w =>
                w.Status == WithdrawalStatus.Submitted ||
                w.Status == WithdrawalStatus.UnderReview ||
                w.Status == WithdrawalStatus.Approved);

            if (hasPending)
                throw new ServiceValidationException("Cannot close project while it has pending or approved-but-undisbursed Withdrawal Applications.");
        }

        if (newStatus >= ProjectStatus.BoardApproval && project.BoardApprovalDate == null)
            project.BoardApprovalDate = DateTime.UtcNow;

        var oldStatus = project.Status;
        project.Status = newStatus;
        await _db.SaveChangesAsync();

        var admin = await _db.Admins.FindAsync(adminId);
        await LogAuditAsync(
            "Project", project.Id, "StatusChanged",
            $"Project {project.ProjectCode} moved from {oldStatus} to {newStatus} by {admin?.Name ?? "Admin"}.",
            admin?.Name ?? "Admin", admin?.Role.ToString() ?? "Admin", project.CountryId);

        return (await GetProjectByIdAsync(project.Id))!;
    }

    public async Task DeleteProjectAsync(int adminId, int projectId)
    {
        var project = await _db.Projects
            .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new ServiceValidationException($"Project with ID {projectId} was not found.");

        if (project.WithdrawalApplications.Any(w => w.Disbursement != null))
            throw new ServiceValidationException(
                "Cannot delete a project that already has recorded disbursements. Close it instead to preserve the financial record.");

        var admin = await _db.Admins.FindAsync(adminId);
        await LogAuditAsync(
            "Project", project.Id, "Deleted",
            $"Project {project.ProjectCode} \"{project.Title}\" deleted by {admin?.Name ?? "Admin"}.",
            admin?.Name ?? "Admin", admin?.Role.ToString() ?? "Admin", project.CountryId);

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
    }
}
