import React from "react";

export default function Footer({ fixed = false, className = "" }) {
  return (
    <footer
      className={[
        "w-full bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-md",
        fixed ? "fixed bottom-0 left-0 right-0 z-[100]" : "",
        className,
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex justify-between items-center h-full">
        <span className="text-sm font-semibold text-gray-700">
          Built by Devansh Mankar
        </span>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} EchoWorks. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
