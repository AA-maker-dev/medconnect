import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FileText, X } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as patientService from '@/services/patient.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MedicalHistoryPage() {
  useSetPageTitle('Medical History');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['patient', 'medical-history'],
    queryFn: patientService.fetchMedicalHistory,
  });

  const createMutation = useMutation({
    mutationFn: () => patientService.createMedicalHistoryEntry({ title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'medical-history'] });
      setFormOpen(false);
      setTitle('');
      setDescription('');
      showToast('Medical history entry added.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.deleteMedicalHistoryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'medical-history'] });
      showToast('Entry removed.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 font-body max-w-lg">
          A personal record of past diagnoses, conditions, and notes — separate from what
          your doctors prescribe.
        </p>
        <Button size="sm" className="w-auto" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen ? 'Cancel' : 'Add entry'}
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) {
              showToast('Please enter a title.', 'error');
              return;
            }
            createMutation.mutate();
          }}
          className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col gap-4"
        >
          <Input
            label="Title"
            placeholder="e.g. Seasonal allergy diagnosis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 font-body">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Any additional notes..."
            />
          </div>
          <Button type="submit" isLoading={createMutation.isPending} className="w-auto self-start">
            Save entry
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
        ) : entries && entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{entry.title}</p>
                {entry.description && (
                  <p className="text-sm text-slate-500 mt-1">{entry.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">{formatDate(entry.recordedAt)}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(entry.id)}
                aria-label="Delete entry"
                className="text-slate-400 hover:text-danger-600 transition-colors duration-fast shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
            No medical history entries yet. Add one to keep a record for yourself.
          </div>
        )}
      </div>
    </div>
  );
}
