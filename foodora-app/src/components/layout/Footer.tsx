import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const year = 2026;

  return (
    <footer className="bg-surface-950 dark:bg-black text-surface-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                food<span className="text-brand-500">ora</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Good Food. Great Mood. Delivered.
            </p>
            <p className="text-xs text-surface-600 leading-relaxed">
              Connecting food lovers with the best restaurants in your city.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Help Centre</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Report an Issue</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600">
            © {year} Foodora — Hackathon Demo Project. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
              { icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
              { icon: <Facebook className="w-4 h-4" />, label: 'Facebook' },
              { icon: <Youtube className="w-4 h-4" />, label: 'YouTube' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-brand-500 hover:text-white transition-all flex items-center justify-center text-surface-400"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
