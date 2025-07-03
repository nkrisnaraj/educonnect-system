import Image from 'next/image'; // ✅ This line is required
import { Mail, Phone, MapPin, Globe } from 'lucide-react';  

export default function Footer() {
  return (
    <div>
      <footer className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                 <Image src="/images/logos/logo.png" alt="EduConnect Logo" width={60} height={60} className="rounded"/>
              </div>
              <h3 className="text-xl font-bold">EduConnect</h3>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4  text-center md:text-left">
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li><a href="#" className="hover:underline hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-colors">Courses</a></li>
              <li><a href="/login" className="hover:underline hover:text-white transition-colors">Login</a></li>
              <li><a href="/help" className="hover:underline hover:text-white transition-colors">Help Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-3">Contact Info</h3>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@educonnect.lk" className="hover:underline hover:text-white transition-colors">
                  support@educonnect.lk
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-400 flex-shrink-0" />
                <a href="tel:+94771234567" className="hover:underline hover:text-white transition-colors">
                  +94 77 123 4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                <span>Jaffna, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Globe size={16} className="text-blue-400 flex-shrink-0" />
                <span>Serving students nationwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-white/80">
            © {new Date().getFullYear()} EduConnect. All rights reserved. | Made with ❤️ in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
}
