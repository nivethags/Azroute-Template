"use client"
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ  () {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "What courses does ConnectED offer?",
      answer: "ConnectED offers a wide range of online courses in healthcare, dental, and medical fields. Our courses are designed for professionals looking to enhance their skills or for students preparing for careers in these industries."
    },
    {
      question: "How do live online classes work?",
      answer: "Our live online classes are conducted through a video conferencing platform. You'll be able to interact with the instructor and other students in real-time, ask questions, and participate in discussions, just like in a physical classroom."
    },
    {
      question: "Are the courses accredited?",
      answer: "Yes, many of our courses are accredited by relevant professional bodies. The specific accreditations are listed on each course page. We ensure our content meets industry standards and provides valuable, recognized qualifications."
    },
    {
      question: "Can I access course materials after the live sessions?",
      answer: "Absolutely! All registered students have access to course materials, including recordings of live sessions, for a specified period after the course ends. This allows you to review the content at your own pace."
    },
    {
      question: "What if I miss a live session?",
      answer: "While we encourage attending all live sessions for the best learning experience, we understand that conflicts may arise. All live sessions are recorded and made available to enrolled students, so you can catch up on any missed content."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className='bg-gray-50'>
    <div className="w-full  max-w-4xl mx-auto px-04 py-16">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-12">
        Frequently Asked Questions
      </h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-blue-50 rounded-lg overflow-hidden"
          >
            <button
              className="w-full text-left p-4 flex justify-between items-center"
              onClick={() => toggleQuestion(index)}
            >
              <span className="text-blue-600 font-medium">{faq.question}</span>
              <ChevronDown 
                className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
                  openQuestion === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-200 ${
                openQuestion === index ? 'max-h-96 p-4 pt-0' : 'max-h-0'
              }`}
            >
              <p className="text-gray-600">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

