import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      {/* // src/app/guests/home.jsx */}
<header className="flex justify-between items-center p-4 shadow-md bg-blue-600 text-white">
  <div className="text-xl font-bold">EduConnect</div>
  <nav className="space-x-4">
    <Link href="#">About</Link>
    <Link href="#">Pricing</Link>
    <Link href="#">Courses</Link>
    <Link href="/login">
      <button className="bg-white text-blue-600 px-4 py-1 rounded">Login</button>
    </Link>
  </nav>
</header>

      {/* Hero Section */}
      <section className="text-center p-10 bg-blue-50">
        <h1 className="text-3xl font-bold mb-2">Welcome to EduConnect!</h1>
        <p className="mb-4 text-gray-700">Streamline payments and webinars for education!</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded">Learn More</button>
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {['Automated Payment Verification', 'Webinar Integration', 'Calendar Sync', 'Monthly Reports'].map((text, i) => (
          <div key={i} className="border p-4 rounded text-center shadow hover:shadow-lg transition">
            <p className="font-medium text-blue-600">{text}</p>
          </div>
        ))}
      </section>

      {/* Upcoming Webinars */}
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Webinars</h2>
        <div className="bg-blue-100 p-4 rounded flex justify-between items-center">
          <div>
            <p className="font-semibold">Management Seminar</p>
            <p className="text-sm text-gray-600">Sep. 20, 2025</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">View All</button>
        </div>
      </section>

      {/* Login & Registration Video Tutorials */}
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Watch: How to Use EduConnect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded shadow text-center">
            <h3 className="font-semibold mb-2">How to Login</h3>
            <video className="w-full rounded" controls>
              <source src="/videos/how-to-login.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="border p-4 rounded shadow text-center">
            <h3 className="font-semibold mb-2">How to Register</h3>
            <video className="w-full rounded" controls>
              <source src="/videos/how-to-register.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Footer */}
<footer className="bg-blue-600 text-white mt-10">
  <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* Column 1: About */}
    <div>
      <h3 className="text-lg font-bold mb-2">EduConnect</h3>
      <p className="text-sm">
        EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
      </p>
    </div>

    {/* Column 2: Links */}
    <div>
      <h3 className="text-lg font-bold mb-2">Quick Links</h3>
      <ul className="space-y-1 text-sm">
        <li><a href="#" className="hover:underline">About Us</a></li>
        <li><a href="#" className="hover:underline">Pricing</a></li>
        <li><a href="#" className="hover:underline">Courses</a></li>
        <li><a href="/login" className="hover:underline">Login</a></li>
      </ul>
    </div>

    {/* Column 3: Contact */}
    <div>
      <h3 className="text-lg font-bold mb-2">Contact</h3>
      <p className="text-sm">📧 support@educonnect.lk</p>
      <p className="text-sm">📞 +94 77 123 4567</p>
      <p className="text-sm">🏫 Uva Wellassa University, Sri Lanka</p>
    </div>
  </div>

  <div className="text-center py-4 bg-blue-700 text-sm">
    © {new Date().getFullYear()} EduConnect. All rights reserved.
  </div>
</footer>

    </div>
  );
}
