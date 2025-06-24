import Footer from "@/components/Footer";
import MainNavbar from "@/components/MainNavbar";
import Image from "next/image";

export default function About() {
  return (
    <>
      <MainNavbar />

      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
          {/* Text Content */}
          <div className=" md:text-left">
            <h4 className="text-blue-600 font-semibold uppercase tracking-widest mb-4">
              EduConnect Platform
            </h4>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
              Automated Payment Intergration &  Webinar Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
              EduConnect is a platform that simplifies the online learning experience for students and educators. It
              automates payment verification using OCR, integrates with webinar tools like Zoom, and provides real-time
              class scheduling with calendar sync. Our goal is to streamline access and improve engagement for everyone.
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-300"
            >
              Learn More
            </a>
          </div>
          {/* Image Section */}
          <div className="flex justify-start gap-6">
            <div className="mt-4 w-1/2 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hero/learning.jpg"
                alt="Learning"
                width={300}
                height={400}
                className="object-cover w-full h-[400px]"
              />
            </div>
            <div className="mt-12 w-1/2 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hero/payment.png"
                alt="Payment"
                width={300}
                height={400}
                className="object-cover bg-white w-full h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
