"use client";
import React, { useState } from "react"; // Import React and useState hook for state management
import { useRouter } from 'next/navigation'; // Updated import for 'useRouter' to be compatible with Next.js 13+ (app directory)
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquarePlus,
  GraduationCap,
  Users,
  Globe,
  ArrowRight,
} from "lucide-react";

export function Hero() {
  const [searchTerm, setSearchTerm] = useState(''); // Manage the search input state
  const router = useRouter(); // Access Next.js router
  const stats = [
    // { label: "Active Learners", value: "500+" },
    // { label: "Expert Teachers", value: "50+" },
    // { label: "Online Courses", value: "100+" },
    // { label: "Success Rate", value: "95%" },
  ];
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value); // Update state with the input value
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) { // Only proceed if search term is not empty
      router.push(`/courses?topic=${encodeURIComponent(searchTerm)}`);
    }
  };

  const popularTopics = [
    "Dentistry ",
    "Nursing",
    "Healthcare",
    "Personal Development",
    // "Technology"
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "Professional Certification",
      description: "Earn recognized certificates upon completion",
    },
    {
      icon: Users,
      title: "Expert-Led Learning",
      description: "Learn from industry professionals",
    },
    {
      icon: Globe,
      title: "Flexible Learning",
      description: "Access courses anytime, anywhere",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base diagonal gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-blue-300"
        aria-hidden="true"
      />
      
      {/* Enhanced background effects */}
      <div 
        className="absolute top-0 right-0 w-2/3 h-2/3 bg-blue-300/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDuration: '8s' }}
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-pink-300/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDuration: '10s' }}
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-pink-200/5 to-blue-200/5"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative">
        <div className="container px-4 py-4 md:py-10 mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center mb-12">
            <Badge className="px-6 py-2 text-base font-medium bg-white border-2 border-blue-100 text-blue-600 shadow-sm">
              🎓 Join our growing community of professionals
            </Badge>
          </div>

          {/* Main heading section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Changing the way we learn and teach online
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Connect with expert instructors and unlock your potential through interactive online learning
            </p>

            {/* Search/Request section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <MessageSquarePlus className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="What do you want to teach or learn?"
                  className="pl-12 h-14 text-lg bg-white border-2 border-blue-100 focus:border-blue-400 rounded-xl shadow-sm"
                  value={searchTerm} // Bind the input value to state
                  onChange={handleInputChange} // Handle input changes
                />
              </div>
              <Button
                onClick={handleSearchClick} // Trigger search on button click
                size="lg"
                className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Popular topics */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <span className="text-base text-gray-500 mr-2">
                Popular Topics:
              </span>
              {popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/courses?topic=${topic.toLowerCase().replace(" ", "-")}`}
                  className="px-6 py-2 rounded-full bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm"
                >
                  {topic}
                </Link>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl bg-white border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border-2 border-blue-100 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="p-4 rounded-full bg-blue-50 mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
