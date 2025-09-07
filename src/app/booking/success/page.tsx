"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-green-50 via-white to-green-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center">
        <div className="w-56 h-56">
          <DotLottieReact
            src="https://lottie.host/f75251f2-af9d-491c-b0dc-34fb296f5f40/NHBJMG0R1v.lottie"
            loop
            autoplay
          />
        </div>

        <h1 className="mt-8 text-3xl font-extrabold text-green-900 tracking-tight">
          Payment Successful
        </h1>

        <p className="mt-4 text-md text-gray-700 max-w-xs">
          Thank you for your booking! Your payment has been securely processed.
          We look forward to serving you.
        </p>

        <div className="flex flex-row mt-6 items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="inline-block text-md rounded-full cursor-pointer py-2 bg-green-600 px-8 text-white  font-semibold transition-transform hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400"
            aria-label="Return to Home"
          >
            Home
          </button>

          <button
            onClick={() => router.push("/player/bookings")}
            className="inline-block"
            aria-label="View My Bookings"
          >
            <span className="inline-block text-md rounded-full cursor-pointer bg-green-100 px-8 py-2 text-green-800 text-md font-medium transition-transform hover:scale-105 hover:bg-green-200 focus:outline-none focus:ring-4 focus:ring-green-200">
              Bookings
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
