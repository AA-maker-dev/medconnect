import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I know a doctor is actually verified?',
    answer:
      'Every doctor on MedConnect submits their medical license and credentials during registration. Our admin team manually reviews and approves each profile before it becomes bookable — you\'ll see a verified badge on every doctor card.',
  },
  {
    question: 'Can I message my doctor after the appointment?',
    answer:
      'Yes. Once you have a booked appointment with a doctor, a private chat opens between you two — you can ask follow-up questions, share images, or receive your prescription directly in the conversation.',
  },
  {
    question: 'What if I need to reschedule or cancel?',
    answer:
      'You can reschedule or cancel from your dashboard up until the doctor confirms the appointment. After confirmation, cancellations are subject to the doctor\'s policy, shown on their profile.',
  },
  {
    question: 'How does payment work?',
    answer:
      'We support eSewa and FonePay for consultation fees. Payment is confirmed before your appointment is finalized, and you can download an invoice from your dashboard afterward.',
  },
  {
    question: 'Is my medical information private?',
    answer:
      'Your medical history, messages, and prescriptions are only visible to you and the doctor you\'re seeing. We never share your data with third parties or use it for advertising.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-5 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-base text-slate-900">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-slate-500"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                    >
                      <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
