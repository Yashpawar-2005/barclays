import { useState } from "react";
import { motion } from "framer-motion";

interface ServiceItem {
  id: number;
  title: string;
  description: string;
  number: string;
}

const serviceData: ServiceItem[] = [
  {
    id: 1,
    title: "Strategic Consulting",
    description:
      "We provide comprehensive business analysis and strategic planning to optimize your operations and drive sustainable growth. Our consultants deliver actionable insights that transform challenges into opportunities.",
    number: "01",
  },
  {
    id: 2,
    title: "Enterprise Solutions",
    description:
      "Tailored enterprise-grade solutions designed to address complex business challenges. We integrate advanced technologies with your existing infrastructure to enhance productivity and performance.",
    number: "02",
  },
  {
    id: 3,
    title: "Digital Transformation",
    description:
      "Navigate the digital landscape with confidence. Our transformation services help organizations evolve their business models, processes, and customer experiences to thrive in the digital economy.",
    number: "03",
  },
  {
    id: 4,
    title: "Risk Management",
    description:
      "Protect your business with our comprehensive risk assessment and management services. We identify vulnerabilities and implement robust strategies to safeguard your assets and reputation.",
    number: "04",
  },
];

export default function WhatWeDoSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-6">
            Our Expertise
          </h2>
          <h3 className="text-4xl font-light text-gray-900 sm:text-5xl max-w-4xl">
            What We <span className="font-bold">Do</span>
          </h3>
          <div className="w-20 h-px bg-black mt-8"></div>
        </div>

        <div className="space-y-16">
          {serviceData.map((service) => (
            <motion.div
              key={service.id}
              className="relative group"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              onMouseEnter={() => setHoveredId(service.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <motion.div
                      className="text-5xl font-extralight text-gray-200"
                      animate={{
                        color: hoveredId === service.id ? "#000000" : "#E5E7EB",
                        y: hoveredId === service.id ? -5 : 0,
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {service.number}
                    </motion.div>
                    <div className="absolute top-full left-0 w-6 h-px bg-black mt-2 transition-all duration-300 group-hover:w-12"></div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <motion.h4
                    className="text-2xl font-bold text-gray-900"
                    animate={{
                      x: hoveredId === service.id ? 5 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {service.title}
                  </motion.h4>
                </div>

                <div className="lg:col-span-7">
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 mt-16 -mb-8"></div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 flex">
          <motion.div
            className="inline-flex"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
}
