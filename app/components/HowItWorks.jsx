// components/HowItWorks.jsx
import { Card, CardContent } from "./ui/card";
import { CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Find Your Course",
      description: "Browse our selection of dental courses and choose what matches your goals."
    },
    {
      number: 2,
      title: "Enroll & Start Learning",
      description: "Join the course and get immediate access to expert-led content."
    },
    {
      number: 3,
      title: "Earn Your Certificate",
      description: "Complete the course and receive your certificate."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How ConnectEd Works</h2>
          <p className="text-muted-foreground">
            Start your learning journey in three simple steps
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
