import { Loader2 } from 'lucide-react';

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-ivory-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
    </div>
  );
}
