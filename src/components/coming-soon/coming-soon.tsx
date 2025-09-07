import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-green-50 to-white px-6">
      <div className="max-w-4xl text-center space-y-2">
        <p className="text-lg text-gray-700 max-w-md mx-auto">
          We are working hard to bring you an amazing experience. Stay tuned for
          something great!
        </p>
        <div className="relative w-full max-w-3xl h-96 mx-auto">
          <Image
            src="/coming_soon.jpg"
            alt="Coming soon illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </main>
  );
}
