import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export function NewsletterSection() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    setIsSubmitting(true);
    // Newsletter backend endpoint arrives with the marketing/CMS work —
    // for now this simulates the round trip so the UI is fully testable.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsSubmitting(false);
    setEmail('');
    showToast("You're subscribed! Health tips land in your inbox weekly.", 'success');
  };

  return (
    <section className="py-20 px-5 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-teal-900 px-6 py-12 sm:px-14 sm:py-16 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-coral-500/20 blur-3xl"
        />
        <Mail className="h-8 w-8 text-coral-500 mx-auto mb-5 relative" />
        <h2 className="font-display text-2xl sm:text-3xl text-ivory-50 mb-3 relative">
          Get health tips in your inbox
        </h2>
        <p className="text-ivory-100/70 font-body mb-8 max-w-md mx-auto relative">
          One short email a week. No spam, unsubscribe anytime.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 flex-1 rounded-md border-0 px-4 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-coral-500"
          />
          <Button type="submit" isLoading={isSubmitting} className="w-auto sm:w-auto whitespace-nowrap">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
