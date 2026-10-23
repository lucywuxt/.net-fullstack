import React, { useEffect, useState } from 'react';
import { History, FileCheck2, Eye, Loader2 } from 'lucide-react';
import type { AuditLogEntry, SupportingDocument } from '../types/api';
import { api } from '../services/api';
import { Dialog, DialogHeader } from './ui/dialog';
import { Badge } from './ui/badge';

function openDocumentInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  // give the new tab a moment to actually load the blob before revoking it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

interface HistoryModalProps {
  entityType: 'WithdrawalApplication' | 'Project';
  entityId: number;
  title: string;
  documents?: SupportingDocument[];
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ entityType, entityId, title, documents, onClose }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    const load = entityType === 'WithdrawalApplication' ? api.getWithdrawalHistory : api.getProjectHistory;
    load(entityId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const handleViewDocument = async (doc: SupportingDocument) => {
    setDocError(null);
    setViewingDocId(doc.id);
    try {
      const { blob } = await api.getDocumentContent(doc.id);
      openDocumentInNewTab(blob);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : `Could not open ${doc.fileName}.`);
    } finally {
      setViewingDocId(null);
    }
  };

  return (
    <Dialog onClose={onClose} className="max-w-xl">
      <DialogHeader
        title={title}
        badge={<Badge variant="muted"><History className="mr-1 h-3 w-3" />Activity History</Badge>}
        onClose={onClose}
      />

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {documents && documents.length > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Supporting Documents ({documents.length})
            </div>
            {docError && <p className="mb-1.5 text-[11px] text-rose-400">{docError}</p>}
            <ul className="space-y-1.5">
              {documents.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                >
                  <FileCheck2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="flex-1 truncate text-foreground">{d.fileName}</span>
                  <Badge variant="muted">{d.documentType}</Badge>
                  <span className="flex-shrink-0 text-muted-foreground">{formatFileSize(d.fileSizeBytes)}</span>
                  {d.hasContent ? (
                    <button
                      type="button"
                      onClick={() => handleViewDocument(d)}
                      disabled={viewingDocId === d.id}
                      title={`View ${d.fileName}`}
                      className="flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-emerald-400 disabled:opacity-50"
                    >
                      {viewingDocId === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] italic text-muted-foreground" title="Uploaded before file storage was enabled">
                      not available
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Timeline
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading history…</div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</div>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-4">
            {entries.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted">{e.action}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground">{e.summary}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {e.performedByName} &middot; {e.performedByRole}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Dialog>
  );
};
