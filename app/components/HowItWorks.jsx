// app/components/HowItWorks.jsx
import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Choose Your Chess Program",
      description: "Select a program that suits your skill level, from beginner to advanced."
    },
    {
      number: 2,
      title: "Learn & Practice",
      description: "Follow the lessons, practice tactics, and improve your skills step by step."
    },
    {
      number: 3,
      title: "Play & Compete",
      description: "Apply your skills in practice games, tournaments, and track your progress."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="p-6 border rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl font-extrabold text-indigo-600 mb-4">{step.number}</div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
