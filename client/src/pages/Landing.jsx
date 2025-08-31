import React from "react";
import Header from "../components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AnimatedGridPattern } from "../components/ui/magicui/animated-grid-pattern";

import Card3D from "./Card";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-hidden bg-white">
      {/* background grid */}
      <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]
                   skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
        width={40}
        height={40}
      />

      {/* header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Hi! We're EchoWorks
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          Turn Every Word Into An Experience.
        </p>

        {/* cards */}
        <div className="mt-6 sm:mt-8">
          <Card3D />
        </div>
      </main>

      {/* footer */}
      <Footer />
    </div>
  );
}
