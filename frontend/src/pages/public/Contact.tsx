import { useState, type FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import emailjs from '@emailjs/browser';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'rautstevensr@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977 1-4000000',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Kathmandu, Nepal',
  },
  {
    icon: Clock,
    label: 'Support hours',
    value: 'Sun – Fri, 9 AM – 6 PM',
  },
];

const EMAILJS_SERVICE_ID = 'service_vdj9mus';
const EMAILJS_PUBLIC_KEY = 'BTXIS1-AD5JDXk452';
const EMAILJS_TEMPLATE_ID = 'template_ect6hfw';

emailjs.init(EMAILJS_PUBLIC_KEY);

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          reply_to: form.email,
          subject: form.subject || 'New contact form message',
          message: form.message,
          to_name: 'MedConnect Support',
        },
        EMAILJS_PUBLIC_KEY
      );
      setForm({ name: '', email: '', subject: '', message: '' });
      showToast('Message sent! We will get back to you within 24 hours.', 'success');
    } catch (err) {
      console.error('EmailJS send failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to send message. Please try again later.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-100/60 via-ivory-50 to-ivory-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-coral-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block rounded-full bg-teal-100 text-teal-700 text-sm font-semibold px-4 py-1.5 mb-6"
          >
            Contact us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-900 mb-5"
          >
            We are here to <span className="text-teal-700">help</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 font-body max-w-2xl mx-auto"
          >
            Have a question about booking, payments, or your account? Reach out
            and our team will respond as soon as possible.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              {CONTACT_INFO.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="font-medium text-slate-900">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              className="lg:col-span-3 rounded-lg border border-slate-100 bg-paper-0 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl text-slate-900 mb-1">
                Send us a message
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Fill out the form below and we will get back to you within one
                business day.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full name <span className="text-coral-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-2.5 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email <span className="text-coral-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-2.5 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-2.5 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message <span className="text-coral-600">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-2.5 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
                    placeholder="Tell us more about your issue or question..."
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  Send message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
