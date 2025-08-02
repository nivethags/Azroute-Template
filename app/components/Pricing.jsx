// components/Pricing.jsx
'use client';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function Pricing() {
  const router = useRouter();
  const features = [
    "Community spaces",
    "Course creation tools",
    "Video conferencing",
    "Group chat",
    "Member directory",
    "Resource hosting",
    "Private messaging",
    "Analytics dashboard"
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            No Monthly Charges, No Hidden Fees
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started without any upfront costs. ConnectEd takes only 25% when you
            make a sale. Keep the lion's share of your earnings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">What's Included:</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 bg-primary/10 rounded-full blur-2xl" />
            
            <CardHeader className="text-center pb-8 relative">
              <CardTitle>
                <div className="text-sm text-muted-foreground mb-2">Starting at</div>
                <div className="text-4xl font-bold text-primary">FREE</div>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Only 25% fee on course sales
              </p>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>No monthly charges</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>No hidden costs</span>
                </div>
              </div>

              <Button  onClick={() => router.push('/auth/teacher/signup')} className="w-full mt-8" size="lg">
                Start Teaching Today
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}