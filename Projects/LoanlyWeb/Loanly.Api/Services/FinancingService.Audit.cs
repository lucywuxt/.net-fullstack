using Loanly.Api.Dtos;
using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public partial class FinancingService
{
    private async Task LogAuditAsync(
        string entityType,
        int entityId,
        string action,
        string summary,
        string performedByName,
        string performedByRole,
        int? countryId)
    {
        _db.AuditLogEntries.Add(new AuditLogEntry
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            Summary = summary,
            PerformedByName = performedByName,
            PerformedByRole = performedByRole,
            CountryId = countryId
        });

        await _db.SaveChangesAsync();
    }

    public async Task<List<AuditLogEntryDto>> GetAuditLogAsync(string entityType, int entityId, int? callerCountryId = null)
    {
        var query = _db.AuditLogEntries.Where(a => a.EntityType == entityType && a.EntityId == entityId);

        if (callerCountryId.HasValue)
            query = query.Where(a => a.CountryId == callerCountryId.Value);

        var entries = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return entries.Select(MapAuditLogToDto).ToList();
    }

    public async Task<List<AuditLogEntryDto>> GetRecentAuditLogAsync(int? countryId = null, int take = 50)
    {
        var query = _db.AuditLogEntries.AsQueryable();

        if (countryId.HasValue)
            query = query.Where(a => a.CountryId == countryId.Value);

        var entries = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .ToListAsync();

        return entries.Select(MapAuditLogToDto).ToList();
    }
}
