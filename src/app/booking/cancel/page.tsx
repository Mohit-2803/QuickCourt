"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

export default function PaymentCancelled() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-red-50 via-white to-red-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center">
        <div className="w-56 h-56">
          <DotLottieReact
            src="https://lottie.host/dd52cd82-ada1-4179-9146-8768bf34ef79/R696Er0wAQ.lottie"
            loop
            autoplay
          />
        </div>

        <h1 className="mt-8 text-4xl font-extrabold text-red-800 tracking-tight">
          Payment Cancelled
        </h1>

        <p className="mt-4 text-lg text-gray-700 max-w-xs">
          Your payment was not completed. You can try again or return to the
          home page.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-10 inline-block rounded-full cursor-pointer bg-red-600 px-10 py-3 text-white text-lg font-semibold transition-transform hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400"
          aria-label="Return to Home"
        >
          Return Home
        </button>
      </div>
    </main>
  );
}
