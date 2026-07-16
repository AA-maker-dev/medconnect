import { MessageSquare } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';

export default function DoctorMessagesPage() {
  useSetPageTitle('Messages');

  return (
    <div className="rounded-lg border border-slate-100 bg-paper-0 p-12 text-center flex flex-col items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
        <MessageSquare className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg text-slate-900 mb-1">
          Real-time messaging arrives in Phase 8
        </p>
        <p className="text-sm text-slate-500 max-w-md">
          Once live, you'll be able to message any patient with a booked appointment
          directly from here — with typing indicators, read receipts, and file sharing.
        </p>
      </div>
    </div>
  );
}
