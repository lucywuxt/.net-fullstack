using System.ComponentModel.DataAnnotations;

namespace Loanly.Api.Models;

public class Country
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(3)]
    public string IsoAlpha3 { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Region { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string IncomeLevel { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string ContactEmail { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

public class Admin
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public AdminRole Role { get; set; } = AdminRole.TaskTeam;

    public ICollection<WithdrawalApplication> ReviewedApplications { get; set; } = new List<WithdrawalApplication>();
}

public class Project
{
    public int Id { get; set; }

    [Required, MaxLength(32)]
    public string ProjectCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public int CountryId { get; set; }
    public Country? Country { get; set; }

    public ProjectSector Sector { get; set; }

    public FinancingInstrument FinancingInstrument { get; set; }

    public decimal ApprovedAmount { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Concept;

    public DateTime? BoardApprovalDate { get; set; }

    public DateTime? ClosingDate { get; set; }

    [Required, MaxLength(2000)]
    public string ProjectDevelopmentObjective { get; set; } = string.Empty;

    public ICollection<WithdrawalApplication> WithdrawalApplications { get; set; } = new List<WithdrawalApplication>();

    public ICollection<ResultsIndicator> ResultsIndicators { get; set; } = new List<ResultsIndicator>();
}

public class WithdrawalApplication
{
    public int Id { get; set; }

    [Required, MaxLength(40)]
    public string ApplicationNumber { get; set; } = string.Empty;

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public ExpenditureCategory Category { get; set; }

    public decimal AmountRequested { get; set; }

    [Required, MaxLength(1500)]
    public string SupportingDocumentsNote { get; set; } = string.Empty;

    public WithdrawalStatus Status { get; set; } = WithdrawalStatus.Submitted;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    public int? ReviewedByAdminId { get; set; }
    public Admin? ReviewedByAdmin { get; set; }

    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }

    public Disbursement? Disbursement { get; set; }

    public ICollection<SupportingDocument> SupportingDocuments { get; set; } = new List<SupportingDocument>();
}

public class SupportingDocument
{
    public int Id { get; set; }

    public int WithdrawalApplicationId { get; set; }
    public WithdrawalApplication? WithdrawalApplication { get; set; }

    [Required, MaxLength(260)]
    public string FileName { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public SupportingDocumentType DocumentType { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// A generic activity-log row covering both WithdrawalApplication and Project
/// lifecycle events, so one feed/history mechanism serves the audit trail
/// view, the notification bell, and future entity types without a schema
/// change. CountryId is denormalized here specifically so the "recent
/// activity for my country" query doesn't need a different join per
/// EntityType.
/// </summary>
public class AuditLogEntry
{
    public int Id { get; set; }

    [Required, MaxLength(40)]
    public string EntityType { get; set; } = string.Empty; // "WithdrawalApplication" | "Project"

    public int EntityId { get; set; }

    [Required, MaxLength(40)]
    public string Action { get; set; } = string.Empty; // "Created" | "StatusChanged" | "Disbursed" | "DocumentAttached" | "IndicatorUpdated"

    [Required, MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string PerformedByName { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string PerformedByRole { get; set; } = string.Empty;

    public int? CountryId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Disbursement
{
    public int Id { get; set; }

    public int WithdrawalApplicationId { get; set; }
    public WithdrawalApplication? WithdrawalApplication { get; set; }

    public decimal AmountDisbursed { get; set; }

    public decimal DesignatedAccountBalanceAfter { get; set; }

    public DateTime DisbursedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(64)]
    public string TransactionReference { get; set; } = string.Empty;
}

public class ResultsIndicator
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    [Required, MaxLength(250)]
    public string IndicatorName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    public decimal BaselineValue { get; set; }

    public decimal TargetValue { get; set; }

    public decimal CurrentValue { get; set; }

    public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
}
