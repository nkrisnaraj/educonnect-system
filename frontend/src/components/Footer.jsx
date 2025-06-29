import Image from 'next/image'; // ✅ This line is required

export default function Footer() {
  return (
    <div>
      <footer className="bg-gray-800 text-white ">
        <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-5 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image 
                src="/images/logos/logo.png" 
                alt="EduConnect Logo" 
                width={100} 
                height={90}
              
              />
              <h3 className="text-xl font-bold">EduConnect</h3>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
            
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li><a href="#" className="hover:underline hover:text-white transition-colors"> About Us</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-colors"> Courses</a></li>
              <li><a href="/login" className="hover:underline hover:text-white transition-colors"> Login</a></li>
               <li><a href="/help" className="hover:underline hover:text-white transition-colors">Help us </a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm text-white/90">
              <p className="flex items-center space-x-2">
                <span></span>
                <a href="mailto:support@educonnect.lk" className="hover:underline">support@educonnect.lk</a>
              </p>
              <p className="flex items-center space-x-2">
                <span></span>
                <a href="tel:+94771234567" className="hover:underline">+94 77 123 4567</a>
              </p>
              <p className="flex items-center space-x-2">
                <span></span>
                <span>Jaffna, Sri Lanka</span>
              </p>
              <p className="flex items-center space-x-2 mt-3">
                <span></span>
                <span>Serving students nationwide</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-4 bg-blue-800 border-t border-blue-500">
          <p className="text-sm">
            © {new Date().getFullYear()} EduConnect. All rights reserved. | Made with ❤️ in Sri Lanka
          </p>
        </div>
      </footer>
    </div>
  );
}
