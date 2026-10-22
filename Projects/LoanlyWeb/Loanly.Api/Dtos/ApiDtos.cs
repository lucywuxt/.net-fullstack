using Loanly.Api.Models;

namespace Loanly.Api.Dtos;

// Auth DTOs
public record LoginRequestDto(string Email, string Password, string AccountType);

public record AuthResponseDto(
    string Token,
    string AccountType,
    int Id,
    string Name,
    string Email,
    string? SubRoleOrRegion,
    string? IsoAlpha3,
    string? IncomeLevel
);

public record DemoCredentialDto(
    string AccountType,
    string Label,
    string Email,
    string Password,
    string RoleDescription
);

// Public (unauthenticated) project summary — only non-sensitive fields
public record PublicProjectSummaryDto(
    string ProjectCode,
    string Title,
    ProjectSector Sector,
    FinancingInstrument FinancingInstrument,
    decimal ApprovedAmount,
    ProjectStatus Status
);

// Country DTO
public record CountrySummaryDto(
    int Id,
    string Name,
    string IsoAlpha3,
    string Region,
    string IncomeLevel,
    string ContactEmail,
    int ActiveProjectCount,
    decimal TotalCommitted,
    decimal TotalDisbursed
);

// Project DTOs
public record ProjectDto(
    int Id,
    string ProjectCode,
    string Title,
    int CountryId,
    string CountryName,
    string CountryIso3,
    string Region,
    ProjectSector Sector,
    FinancingInstrument FinancingInstrument,
    decimal ApprovedAmount,
    decimal TotalDisbursed,
    decimal CommittedPendingDisbursement,
    decimal RemainingUndisbursedAmount,
    decimal AvailableToRequestAmount,
    ProjectStatus Status,
    DateTime? BoardApprovalDate,
    DateTime? ClosingDate,
    string ProjectDevelopmentObjective,
    List<ResultsIndicatorDto> ResultsIndicators,
    List<WithdrawalApplicationDto> WithdrawalApplications
);

public record CreateProjectRequestDto(
    string Title,
    int CountryId,
    ProjectSector Sector,
    FinancingInstrument FinancingInstrument,
    decimal ApprovedAmount,
    ProjectStatus InitialStatus,
    DateTime? ClosingDate,
    string ProjectDevelopmentObjective
);

public record UpdateProjectStatusRequestDto(
    ProjectStatus NewStatus
);

// Withdrawal Application DTOs
public record WithdrawalApplicationDto(
    int Id,
    string ApplicationNumber,
    int ProjectId,
    string ProjectCode,
    string ProjectTitle,
    int CountryId,
    string CountryName,
    ExpenditureCategory Category,
    decimal AmountRequested,
    string SupportingDocumentsNote,
    WithdrawalStatus Status,
    DateTime SubmittedAt,
    DateTime? ReviewedAt,
    int? ReviewedByAdminId,
    string? ReviewedByAdminName,
    string? ReviewNotes,
    DisbursementDto? Disbursement
);

public record CreateWithdrawalApplicationRequestDto(
    int ProjectId,
    ExpenditureCategory Category,
    decimal AmountRequested,
    string SupportingDocumentsNote
);

public record ReviewWithdrawalApplicationRequestDto(
    WithdrawalStatus DecisionStatus,
    string? ReviewNotes
);

// Disbursement DTOs
public record DisbursementDto(
    int Id,
    int WithdrawalApplicationId,
    string ApplicationNumber,
    int ProjectId,
    string ProjectCode,
    string ProjectTitle,
    string CountryName,
    ExpenditureCategory Category,
    decimal AmountDisbursed,
    decimal DesignatedAccountBalanceAfter,
    DateTime DisbursedAt,
    string TransactionReference
);

public record RecordDisbursementRequestDto(
    int WithdrawalApplicationId,
    decimal AmountDisbursed,
    string? TransactionReference
);

// Results Indicator DTOs
public record ResultsIndicatorDto(
    int Id,
    int ProjectId,
    string IndicatorName,
    string Unit,
    decimal BaselineValue,
    decimal TargetValue,
    decimal CurrentValue,
    decimal ProgressPercent,
    DateTime MeasuredAt
);

public record UpsertResultsIndicatorRequestDto(
    int? Id,
    int ProjectId,
    string IndicatorName,
    string Unit,
    decimal BaselineValue,
    decimal TargetValue,
    decimal CurrentValue
);

// Portfolio Analytics DTOs (Admin Portal)
public record PortfolioAnalyticsDto(
    decimal TotalCommitted,
    decimal TotalDisbursed,
    decimal TotalUndisbursed,
    decimal DisbursementRatePercent,
    int TotalProjectsCount,
    int ActiveProjectsCount,
    int PendingWithdrawalsCount,
    decimal PendingWithdrawalsVolume,
    List<BreakdownItemDto> BySector,
    List<BreakdownItemDto> ByRegion,
    List<BreakdownItemDto> ByInstrument,
    List<BreakdownItemDto> ByStatus
);

public record BreakdownItemDto(
    string Label,
    int ProjectCount,
    decimal CommittedAmount,
    decimal DisbursedAmount
);

// World Bank Public API Normalized DTOs
public record IndicatorOptionDto(
    string Code,
    string Name,
    string Unit,
    string Description,
    string ColorScale
);

public record CountryYearValueDto(
    string CountryIso3,
    string CountryName,
    string Region,
    int Year,
    double? Value
);

public record GlobalIndicatorDatasetDto(
    string IndicatorCode,
    string IndicatorName,
    string Unit,
    int MinYear,
    int MaxYear,
    List<GlobalHighlightStatDto> Highlights,
    List<CountryYearValueDto> DataPoints
);

public record GlobalHighlightStatDto(
    string Label,
    string FormattedValue,
    string Subtext,
    string TrendDirection
);

public record CountryIndicatorSeriesDto(
    string CountryIso3,
    string CountryName,
    string IndicatorCode,
    string IndicatorName,
    string Unit,
    double? LatestValue,
    int? LatestYear,
    List<YearPointDto> Series
);

public record YearPointDto(
    int Year,
    double? Value
);

// AI Chat DTOs
public record ChatMessageHistoryItemDto(
    string Role,
    string Content
);

public record ChatRequestDto(
    string Message,
    int? SelectedProjectId,
    int? SelectedWithdrawalId,
    List<ChatMessageHistoryItemDto>? History
);

public record ChatResponseDto(
    string Reply,
    string ModelUsed,
    List<string> SuggestedFollowUps,
    string ContextSummary
);
