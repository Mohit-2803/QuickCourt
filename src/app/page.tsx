import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-200">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col-reverse lg:flex-row items-center gap-16">
        {/* Text Content */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-green-900 leading-tight">
            Book Courts Effortlessly & Play Your Best
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Discover and reserve the best sports courts near you with instant
            confirmations, secure payments, and flexible scheduling. Whether
            tennis, basketball, or badminton — we make booking easy and
            reliable.
          </p>

          {session?.user ? (
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link href="/player/bookings" passHref>
                <Button
                  className="px-8 py-4 cursor-pointer"
                  size="lg"
                  variant="default"
                >
                  View My Bookings
                </Button>
              </Link>
              <Link href="/player/profile" passHref>
                <Button
                  className="px-8 py-4 cursor-pointer"
                  size="lg"
                  variant="outline"
                >
                  My Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link href="/login" passHref>
                <Button
                  className="px-8 py-4 cursor-pointer"
                  size="lg"
                  variant="default"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* hide hero image in phone */}
        <div className="lg:w-1/2 relative w-full h-80 md:h-[28rem] rounded-3xl overflow-hidden hidden lg:block">
          <Image
            src="/home_3.jpg"
            alt="Sports court booking illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              title: "Instant Booking",
              description:
                "Check real-time availability and book your court instantly without any hassle or waiting.",
            },
            {
              title: "Secure Payments",
              description:
                "Powered by Stripe for safe, fast, and convenient payment processing — supporting all major credit cards.",
            },
            {
              title: "Manage Bookings",
              description:
                "Easily view, reschedule, or cancel your bookings anytime from your dashboard.",
            },
          ].map(({ title, description }) => (
            <div key={title} className="space-y-4">
              <h3 className="text-2xl font-bold text-green-900">{title}</h3>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <Image
          className="w-full"
          src="/home_1.jpg"
          alt="Happy players enjoying sports"
          width={500}
          height={300}
        />
        <div>
          <h2 className="text-4xl font-extrabold text-green-900 mb-6">
            Why Choose Our Platform?
          </h2>
          <ul className="list-disc list-inside space-y-4 text-md text-gray-700">
            <li>
              Extensive network of vetted courts across multiple sports and
              locations.
            </li>
            <li>
              Transparent pricing and no hidden fees for full peace of mind.
            </li>
            <li>User-friendly app and web experience on all your devices.</li>
            <li>Dedicated 24/7 customer support to assist you anytime.</li>
            <li>Secure account system with privacy-first design.</li>
          </ul>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-green-50 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-green-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                name: "Sarah L.",
                text: "Booking my badminton court has never been easier. The platform is intuitive and payments are hassle-free!",
              },
              {
                name: "James K.",
                text: "Great customer service and a wide range of courts near me. I love how fast I can book my sessions.",
              },
              {
                name: "Emily W.",
                text: "The best court booking app I've used. I appreciate the transparency and quick confirmations.",
              },
            ].map(({ name, text }, i) => (
              <blockquote
                key={i}
                className="bg-white rounded-xl shadow-lg p-8 text-gray-700 italic"
              >
                “{text}”
                <footer className="mt-4 text-sm font-semibold text-green-900">
                  — {name}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-20 bg-green-200 text-center">
        <h2 className="text-4xl font-extrabold mb-4">
          Ready to Book Your Court?
        </h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg">
          Join thousands of players who trust us for their sports bookings.
          Start your game now!
        </p>
        <Link href="/venues" passHref>
          <Button
            variant="outline"
            size="lg"
            className="mx-auto px-12 cursor-pointer"
          >
            Book Now
          </Button>
        </Link>
      </section>
    </main>
  );
}
