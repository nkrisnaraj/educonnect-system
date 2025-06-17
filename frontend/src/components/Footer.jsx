

export default function Footer() {
  return (
    <div>
        <footer className="bg-primary text-white mt-10 dark:bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-2">EduConnect</h3>
            <p className="text-sm text-white/90">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm text-white/90">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
              <li><a href="#" className="hover:underline">Courses</a></li>
              <li><a href="/login" className="hover:underline">Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-sm text-white/90">📧 support@educonnect.lk</p>
            <p className="text-sm text-white/90">📞 +94 77 123 4567</p>
            <p className="text-sm text-white/90">🏫 Uva Wellassa University, Sri Lanka</p>
          </div>
        </div>
        
        <div className="text-center py-4 bg-gray-900 text-sm">
          © {new Date().getFullYear()} EduConnect. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
