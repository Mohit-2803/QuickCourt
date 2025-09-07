import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 min-h-screen">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image Section */}
        <div className="relative w-full h-80 md:h-[28rem] rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/about.jpg"
            alt="About our service"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Content */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            About QuickCourt - Sports Booking Made Easy
          </h1>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Welcome to our premier court booking platform—your go-to solution to
            effortlessly reserve courts for sports, fitness, and recreation. We
            are dedicated to making your booking experience smooth, intuitive,
            and trustworthy.
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Our easy-to-use interface helps you find the best courts available,
            compare pricing, and manage your bookings all in one place. We
            partner with venues committed to quality and convenience to ensure
            you enjoy every session.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Whether youre a casual player or a professional athlete, our
            platform is designed to meet your needs with transparent pricing,
            instant confirmations, and seamless payments.
          </p>
        </div>
      </section>
    </main>
  );
}
