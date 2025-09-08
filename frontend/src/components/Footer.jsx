import Image from 'next/image';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white pt-12">
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center shadow-lg">
                <Image src="/images/logos/logo.png" alt="EduConnect Logo" width={56} height={56} className="rounded" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-white">EduConnect</h3>
            </div>
            <p className="text-base text-white/80 leading-relaxed">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="hover:scale-110 transition-transform">
                <Image src="/images/social/facebook.svg" alt="Facebook" width={28} height={28} />
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <Image src="/images/social/twitter.svg" alt="Twitter" width={28} height={28} />
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <Image src="/images/social/linkedin.svg" alt="LinkedIn" width={28} height={28} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5 text-center md:text-left">
            <h3 className="text-xl font-bold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:underline hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:underline hover:text-blue-400 transition-colors">Courses</a></li>
              <li><a href="/login" className="hover:underline hover:text-blue-400 transition-colors">Login</a></li>
              <li><a href="/help" className="hover:underline hover:text-blue-400 transition-colors">Help Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold mb-3 text-white">Contact Info</h3>
            <div className="space-y-4 text-base">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@educonnect.lk" className="hover:underline hover:text-blue-400 transition-colors">
                  support@educonnect.lk
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-400 flex-shrink-0" />
                <a href="tel:+94771234567" className="hover:underline hover:text-blue-400 transition-colors">
                  +94 77 123 4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-blue-400 flex-shrink-0" />
                <span>Jaffna, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Globe size={18} className="text-blue-400 flex-shrink-0" />
                <span>Serving students nationwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-blue-800  border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="text-center text-sm text-white/80">
            © {new Date().getFullYear()} EduConnect. All rights reserved. | Made with <span className="text-red-400">❤️</span> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}