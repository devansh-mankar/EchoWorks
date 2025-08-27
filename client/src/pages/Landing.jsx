import React from "react";
import Header from "../components/layout/Header";
import { AnimatedGridPattern } from "../components/magicui/animated-grid-pattern";
import AnimatedMail from "./AnimateMail";
import Card3D from "./Card";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="absolute inset-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] 
                   skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
        width={40}
        height={40}
      />

      <div className="relative z-10">
        <Header />

        <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hi! We're EchoWorks
          </h1>

          <p className="mt-4 text-xl text-gray-600">
            Turn Every Word Into An Experience.
          </p>

          {/* Render the two cards */}
          <div className="mt-4">
            <Card3D />
          </div>
        </main>
      </div>
    </div>
  );
}
