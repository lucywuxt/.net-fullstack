using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Services;

public record SupportingDocumentContent(byte[] Bytes, string ContentType, string FileName, int OwnerCountryId);

public partial class FinancingService
{
    public async Task<SupportingDocumentContent> GetSupportingDocumentContentAsync(int documentId)
    {
        var doc = await _db.SupportingDocuments
            .Include(d => d.WithdrawalApplication).ThenInclude(w => w!.Project)
            .FirstOrDefaultAsync(d => d.Id == documentId)
            ?? throw new ServiceValidationException("Supporting document was not found.");

        if (doc.FileContent == null || doc.FileContent.Length == 0)
            throw new ServiceValidationException(
                $"'{doc.FileName}' has no stored file content (it was likely uploaded before file storage was enabled).");

        return new SupportingDocumentContent(
            doc.FileContent, doc.ContentType ?? "application/octet-stream", doc.FileName,
            doc.WithdrawalApplication?.Project?.CountryId ?? 0);
    }
}
