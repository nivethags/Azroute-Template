"use client";

import { ClipboardList, Star, Timer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-black-50 to-white-200 px-6 py-12">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Student Assessment</h1>
        <p className="text-lg text-gray-700 mb-10">
          Assess your chess skills through our customized tests and track your progress with detailed reports.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AssessmentCard
            title="Tactical Puzzle Test"
            icon={<Star className="w-8 h-8 text-orange-500" />}
            description="Solve 10 puzzles to evaluate your tactical vision and calculation skills."
            action="Start Test"
          />
          <AssessmentCard
            title="Opening Knowledge Quiz"
            icon={<ClipboardList className="w-8 h-8 text-orange-500" />}
            description="Multiple choice questions to check your understanding of common chess openings."
            action="Take Quiz"
          />
          <AssessmentCard
            title="Endgame Evaluation"
            icon={<Timer className="w-8 h-8 text-orange-500" />}
            description="Test your knowledge on essential endgames like king-pawn and rook endgames."
            action="Begin Now"
          />
          <AssessmentCard
            title="Strategy Essay"
            icon={<FileText className="w-8 h-8 text-orange-500" />}
            description="Write a short essay on positional strategy to improve your conceptual depth."
            action="Submit Essay"
          />
        </div>
      </div>
    </div>
  );
}

function AssessmentCard({ title, icon, description, action }) {
  return (
    <div className="border border-gray-200 rounded-xl shadow-sm p-6 bg-blue-50 hover:shadow-md transition">
      <div className="flex items-center mb-4 space-x-4">
        <div>{icon}</div>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <Button className="bg-gray-900 text-white hover:bg-gray-800">{action}</Button>
    </div>
  );
}
