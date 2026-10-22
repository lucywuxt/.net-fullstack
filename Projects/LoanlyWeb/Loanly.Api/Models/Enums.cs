using System.Text.Json.Serialization;

namespace Loanly.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AdminRole
{
    TaskTeam,
    DisbursementOfficer
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectSector
{
    Infrastructure,
    Health,
    Education,
    Climate
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FinancingInstrument
{
    IBRDLoan,
    IDACredit,
    IDAGrant
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Concept = 0,
    Appraisal = 1,
    Negotiation = 2,
    BoardApproval = 3,
    Active = 4,
    Closed = 5
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExpenditureCategory
{
    Works,
    Goods,
    ConsultingServices,
    Training,
    OperatingCosts
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WithdrawalStatus
{
    Submitted,
    UnderReview,
    Approved,
    Disbursed,
    Rejected
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SupportingDocumentType
{
    Invoice,
    InterimPaymentCertificate,
    StatementOfExpenditures,
    AuditReport,
    Contract,
    Other
}
