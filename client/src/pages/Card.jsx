import React from "react";
import Button from "./Button";
import { toast } from "sonner";

const TwoCards = () => {
  const handleButtonClick = (feature) => {
    toast.info("Please login/Signup first to access " + feature, {
      duration: 3000,
      position: "top-center",
    });
  };

  return (
    <div className="flex justify-center items-center gap-20 p-10">
      {/* Card 1 */}
      <div className="w-120 h-80 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 hover:scale-105 p-6 flex flex-col justify-between">
        <h2 className="text-2xl font-bold text-gray-800 m-1">EMAIL THEATER</h2>
        <p className="text-gray-600 text-xl">
          Transform boring emails into dramatic performances with unique voices
          for each sender.
        </p>
        <div className="flex justify-center items-center mb-2">
          <Button onClick={() => handleButtonClick("Email Theater")} />
        </div>
      </div>

      {/* Card 2 */}
      <div className="w-120 h-80 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 hover:scale-105 p-6 flex flex-col justify-between">
        <h2 className="text-2xl font-bold text-gray-800 m-1">KNOWLEDGE BASE</h2>
        <p className="text-gray-600 text-xl">
          Convert complex topics into engaging conversations with AI-powered
          audio explanations.
        </p>
        <div className="flex justify-center items-center mb-2">
          <Button onClick={() => handleButtonClick("Knowledge Base")} />
        </div>
      </div>
    </div>
  );
};

export default TwoCards;
