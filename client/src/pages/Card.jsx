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

  const Card = ({ title, description, feature }) => (
    <div className="w-120 h-80 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 hover:scale-105 p-6 flex flex-col items-center text-center">
      {/* Content section (centered vertically with flex-grow) */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>

      {/* Button at bottom */}
      <div className="mt-4">
        <Button onClick={() => handleButtonClick(feature)} />
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center gap-20 p-10">
      <Card
        title="EMAIL THEATER"
        description="Transform boring emails into dramatic performances with unique voices for each sender."
        feature="Email Theater"
      />
      <Card
        title="KNOWLEDGE BASE"
        description="Convert complex topics into engaging conversations with AI-powered audio explanations."
        feature="Knowledge Base"
      />
    </div>
  );
};

export default TwoCards;
