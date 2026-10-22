using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class GeminiChatService
{
    private async Task<string> GenerateContextualOperationsReplyAsync(
        string userType,
        int userId,
        string userMessage,
        string contextBlock)
    {
        var msg = userMessage.Trim().ToLowerInvariant();

        if (msg.Contains("recipe") || msg.Contains("weather") || msg.Contains("movie") || msg.Contains("joke") || msg.Contains("football") || msg.Contains("soccer"))
        {
            return "I am scoped exclusively to **Loanly (World Bank Client Connection)** operations—including expenditure categories, Withdrawal Application statuses, supporting documentation requirements, and IBRD/IDA financing instruments. Please ask a question about your projects or disbursement procedures.";
        }

        if (msg.Contains("travel") || msg.Contains("category") || msg.Contains("expenditure") || msg.Contains("consultant"))
        {
            return """
Under World Bank **Investment Project Financing (IPF)** disbursement guidelines, expenditure categorization depends on the purpose of the cost:

1. **ConsultingServices**: Reimbursable **consultant travel, per diem, and airfare** incurred as part of an eligible consulting contract (firm or individual consultant) fall under **ConsultingServices**, supported by the consultant's contract milestone invoice and travel receipts.
2. **Training**: Travel and subsistence allowances for **government officials or trainees attending workshops, study tours, or capacity-building courses** fall under **Training** (supported by a Statement of Expenditures / SOE and training agenda).
3. **OperatingCosts**: Incremental field supervision travel by **Project Implementation Unit (PIU) staff** for routine project monitoring falls under **OperatingCosts** (supported by quarterly Interim Unaudited Financial Reports / IFRs).
4. **Works & Goods**: Cover physical civil construction (IPCs required) and equipment/materials procurement (invoices + bills of lading required).
""";
        }

        if (msg.Contains("ibrd") || msg.Contains("ida") || msg.Contains("instrument") || msg.Contains("grant") || msg.Contains("credit") || msg.Contains("loan"))
        {
            return """
World Bank sovereign financing uses three primary instruments in **Loanly**:

- **IBRD Loan** (*International Bank for Reconstruction and Development*): Market-based sovereign loans for middle-income and creditworthy lower-income countries (e.g., India, Brazil, Colombia, Viet Nam), featuring flexible variable spreads and long maturities (typically 18–35 years).
- **IDA Credit** (*International Development Association*): Highly concessional, zero- or very-low-interest financing for lower-income member countries (e.g., Kenya, Nigeria) with 30–40 year maturities and a 5–10 year grace period.
- **IDA Grant**: Non-repayable financing provided to low-income countries at elevated risk of debt distress or for high-priority regional/maternal health interventions (such as **P178402** in Kenya).

Regardless of instrument, a Project must reach **Active** status before the borrower can submit **Withdrawal Applications** against its approved ceiling.
""";
        }

        if (userType == "Country")
        {
            var country = await _db.Countries
                .Include(c => c.Projects).ThenInclude(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
                .FirstOrDefaultAsync(c => c.Id == userId);

            if (country != null)
            {
                var latestWa = country.Projects.SelectMany(p => p.WithdrawalApplications)
                    .OrderByDescending(w => w.SubmittedAt)
                    .FirstOrDefault();

                var activeProjects = country.Projects.Where(p => p.Status == ProjectStatus.Active).ToList();
                var summaryLines = activeProjects.Select(p =>
                {
                    var disb = FinancingService.GetTotalDisbursed(p);
                    var pending = FinancingService.GetApprovedPendingDisbursement(p);
                    var rem = p.ApprovedAmount - disb;
                    return $"- **{p.ProjectCode} ({p.Title})** [{p.FinancingInstrument}]: Ceiling **${p.ApprovedAmount:N0}** | Disbursed **${disb:N0}** | Remaining Undisbursed **${rem:N0}** (${rem - pending:N0} uncommitted after approved WAs)";
                });

                var waLine = latestWa != null
                    ? $"Your most recent Withdrawal Application is **{latestWa.ApplicationNumber}** under project **{latestWa.Project?.ProjectCode}** for **${latestWa.AmountRequested:N0}** (*{latestWa.Category}*), which is currently **{latestWa.Status}** (submitted {latestWa.SubmittedAt:yyyy-MM-dd})."
                    : "You have not submitted any Withdrawal Applications yet.";

                return $"Here is the live status for **{country.Name}** from Client Connection:\n\n{waLine}\n\n**Active Projects & Undisbursed Ceilings:**\n{string.Join("\n", summaryLines)}";
            }
        }

        return $"Based on your live **Client Connection** session:\n\n```text\n{contextBlock.Trim()}\n```\n\nYou can ask me about specific **Withdrawal Application statuses**, **expenditure category rules** (Works, Goods, ConsultingServices, Training, OperatingCosts), **supporting documentation**, or **project ceiling balances**.";
    }
}
