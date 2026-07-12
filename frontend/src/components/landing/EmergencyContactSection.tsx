import { Phone, Ambulance, ShieldAlert } from 'lucide-react';

const CONTACTS = [
  { icon: Ambulance, label: 'Ambulance', number: '102' },
  { icon: ShieldAlert, label: 'Police', number: '100' },
  { icon: Phone, label: 'MedConnect 24/7 Helpline', number: '+977 1-4000000' },
];

export function EmergencyContactSection() {
  return (
    <section className="py-10 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-lg bg-danger-100 border border-danger-600/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-11 w-11 rounded-full bg-danger-600 text-white flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-lg text-slate-900">In an emergency?</p>
            <p className="text-sm text-slate-500">Don't wait for a booking — call now.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 sm:ml-auto">
          {CONTACTS.map((contact) => (
            <a
              key={contact.label}
              href={`tel:${contact.number.replace(/\s/g, '')}`}
              className="flex items-center gap-2 rounded-md bg-paper-0 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow duration-fast"
            >
              <contact.icon className="h-4 w-4 text-danger-600" />
              <span className="text-sm text-slate-700">
                {contact.label}: <span className="font-semibold">{contact.number}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
