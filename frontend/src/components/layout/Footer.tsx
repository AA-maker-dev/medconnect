import { Link } from 'react-router-dom';
import { HeartPulse, Mail, MapPin, Phone } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Find a Doctor', to: '/doctors' },
      { label: 'Specialties', to: '/specialties' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'For Doctors', to: '/register/doctor' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Refund Policy', to: '/refunds' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-teal-900 text-ivory-100 pt-16 pb-24 lg:pb-10 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-6 w-6 text-coral-500" />
            <span className="font-display text-xl text-ivory-50">MedConnect</span>
          </Link>
          <p className="text-sm text-ivory-100/70 leading-relaxed max-w-xs mb-5">
            Connecting patients with verified doctors for appointments, messaging, and
            care that doesn't stop at the clinic door.
          </p>
          <div className="flex flex-col gap-2 text-sm text-ivory-100/70">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +977 1-4000000
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> support@medconnect.app
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Kathmandu, Nepal
            </span>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm text-ivory-50 mb-4 tracking-wide uppercase">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ivory-100/70 hover:text-ivory-50 transition-colors duration-fast"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl mt-12 pt-6 border-t border-ivory-100/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory-100/50">
        <span>© {new Date().getFullYear()} MedConnect. All rights reserved.</span>
        <span>Made for better healthcare access.</span>
      </div>
    </footer>
  );
}
