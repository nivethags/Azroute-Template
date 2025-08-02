// components/TeacherCTA.jsx
'use client';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export function TeacherCTA() {
  const router = useRouter();

  const benefits = [
    "Create and sell your own courses",
    "Host live training sessions",
    "Build your professional network",
    "Earn from your expertise"
  ];

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Become a Teacher</h2>
            <p className="text-xl mb-6">
              Share your dental expertise and earn while teaching others
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link href="/teach">
              <Button onClick={() => router.push('/auth/teacher/signup')} variant="secondary" size="lg" className="mt-8">
                Start Teaching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Card className="bg-white backdrop-blur">
              <CardHeader>
                <h3 className="text-xl font-semibold">No Monthly Fees</h3>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Get started without any upfront costs. We only take 25% when you make a sale.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    <span>Keep 85% of your earnings</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    <span>No hidden charges</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    <span>Get paid directly</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}