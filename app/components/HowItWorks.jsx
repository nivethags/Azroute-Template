// components/HowItWorks.jsx
import { Card, CardContent } from "./ui/card";
import { CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Chess Program",
      description: "Select a program that suits your skill level, from beginner to advanced."
    },
    {
      number: 2,
      title: "Learn from Expert Coaches",
      description: "Join classes led by experienced chess coaches and access interactive lessons."
    },
    {
      number: 3,
      title: "Play & Compete",
      description: "Apply your skills in practice games, tournaments, and track your progress."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Azroute Chess Institute Works</h2>
          <p className="text-muted-foreground">
            Master chess in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="text-center p-6">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
