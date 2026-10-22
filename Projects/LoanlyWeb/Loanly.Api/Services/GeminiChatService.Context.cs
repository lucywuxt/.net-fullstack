using System.Text;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class GeminiChatService
{
    private async Task<(string ContextBlock, string Summary)> BuildLiveContextAsync(
        string userType,
        int userId,
        int? selectedProjectId,
        int? selectedWithdrawalId)
    {
        var sb = new StringBuilder();

        if (userType == "Country")
        {
            var country = await _db.Countries
                .Include(c => c.Projects).ThenInclude(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
                .Include(c => c.Projects).ThenInclude(p => p.ResultsIndicators)
                .FirstOrDefaultAsync(c => c.Id == userId);

            if (country == null) return ("Unauthenticated or unknown country session.", "No country context");

            sb.AppendLine($"Role: Borrower Country Official | Country: {country.Name} ({country.IsoAlpha3}) | Region: {country.Region} | Income Level: {country.IncomeLevel}");
            foreach (var p in country.Projects.OrderByDescending(p => p.Status == ProjectStatus.Active))
            {
                var disbursed = FinancingService.GetTotalDisbursed(p);
                var pendingApproved = FinancingService.GetApprovedPendingDisbursement(p);
                var remaining = p.ApprovedAmount - disbursed;
                sb.AppendLine($"- Project {p.ProjectCode}: \"{p.Title}\" | Instrument: {p.FinancingInstrument} | Sector: {p.Sector} | Status: {p.Status} | Ceiling: ${p.ApprovedAmount:N0} | Disbursed: ${disbursed:N0} | Approved Pending: ${pendingApproved:N0} | Remaining Undisbursed: ${remaining:N0}");

                foreach (var w in p.WithdrawalApplications.OrderByDescending(x => x.SubmittedAt).Take(5))
                {
                    sb.AppendLine($"  * WA {w.ApplicationNumber}: Category={w.Category}, Amount=${w.AmountRequested:N0}, Status={w.Status}, Submitted={w.SubmittedAt:yyyy-MM-dd}");
                }
            }

            return (sb.ToString(), $"{country.Name} ({country.Projects.Count} projects)");
        }
        else
        {
            var admin = await _db.Admins.FindAsync(userId);
            var projects = await _db.Projects
                .Include(p => p.Country)
                .Include(p => p.WithdrawalApplications).ThenInclude(w => w.Disbursement)
                .ToListAsync();

            sb.AppendLine($"Role: World Bank Admin ({admin?.Name ?? "Staff"} - {admin?.Role})");
            sb.AppendLine($"Portfolio Total Projects: {projects.Count} (Active: {projects.Count(p => p.Status == ProjectStatus.Active)})");

            foreach (var p in projects)
            {
                var disbursed = FinancingService.GetTotalDisbursed(p);
                var remaining = p.ApprovedAmount - disbursed;
                sb.AppendLine($"- {p.ProjectCode} ({p.Country?.Name}): {p.Title} | {p.FinancingInstrument} | Status={p.Status} | Ceiling=${p.ApprovedAmount:N0} | Remaining=${remaining:N0}");
            }

            var pendingApps = projects.SelectMany(p => p.WithdrawalApplications)
                .Where(w => w.Status != WithdrawalStatus.Disbursed && w.Status != WithdrawalStatus.Rejected)
                .OrderByDescending(w => w.SubmittedAt)
                .ToList();

            sb.AppendLine("Actionable Withdrawal Applications:");
            foreach (var w in pendingApps)
            {
                sb.AppendLine($"  * {w.ApplicationNumber} ({w.Project?.ProjectCode} - {w.Project?.Country?.Name}): Category={w.Category}, Amount=${w.AmountRequested:N0}, Status={w.Status}");
            }

            return (sb.ToString(), $"World Bank Portfolio ({projects.Count} projects, {pendingApps.Count} actionable WAs)");
        }
    }
}
