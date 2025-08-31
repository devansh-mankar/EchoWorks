import React from "react";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";
import TwoCards from "@/pages/Card";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-0px)] flex flex-col w-full overflow-hidden bg-white">
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

      {/* main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* hero */}
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to EchoWorks!
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Transform everyday text into extraordinary audio experiences. From
            emails that perform themselves to knowledge that speaks directly to
            you.
          </p>
        </section>

        {/* cards */}
        <section className="mt-10 sm:mt-12 w-full max-w-5xl">
          <TwoCards />
        </section>
      </main>
    </div>
  );
}
