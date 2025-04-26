import { useState } from "react";
import { motion } from "framer-motion";

interface AdvantageItem {
  id: number;
  title: string;
  description: string;
  years?: string;
  subtitle?: string;
}

const advantageData: AdvantageItem[] = [
  {
    id: 1,
    title: "Unparalleled Expertise",
    description:
      "Our team consists of industry veterans with decades of combined experience, delivering exceptional results across diverse sectors. We bring specialized knowledge to each project, ensuring superior outcomes.",
    years: "25+",
    subtitle: "YEARS EXPERIENCE",
  },
  {
    id: 2,
    title: "Client-Centric Approach",
    description:
      "We place your business objectives at the center of everything we do. Our collaborative methodology ensures solutions that are perfectly aligned with your goals and deliver lasting value to your organization.",
  },
  {
    id: 3,
    title: "Proven Results",
    description:
      "Our success is measured by your success. We maintain an exceptional track record of delivering projects on time, within budget, and exceeding expectations, backed by measurable impacts on our clients' businesses.",
  },
  {
    id: 4,
    title: "Innovative Solutions",
    description:
      "We combine time-tested methodologies with forward-thinking approaches to address your unique challenges. Our solutions are designed to give you a competitive edge in today's rapidly evolving business landscape.",
  },
];

export default function WhyChooseUsSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-6">
            DISTINCTION
          </h2>
          <h3 className="text-4xl font-light text-gray-900 sm:text-5xl max-w-4xl">
            Why <span className="font-bold">Choose Us</span>
          </h3>
          <div className="w-20 h-px bg-black mt-8"></div>

          <div className="mt-12 max-w-2xl">
            <p className="text-gray-600 leading-relaxed">
              We've built our reputation on a foundation of excellence,
              integrity, and unwavering commitment to our clients' success. Our
              distinctive approach combines deep industry knowledge with
              innovative thinking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left side content - Feature bullets */}
          <div className="lg:col-span-6 space-y-16">
            {advantageData.slice(1).map((advantage) => (
              <motion.div
                key={advantage.id}
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                onMouseEnter={() => setHoveredId(advantage.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.h4
                  className="text-2xl font-bold text-gray-900 mb-5"
                  animate={{
                    x: hoveredId === advantage.id ? 5 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {advantage.title}
                </motion.h4>
                <p className="text-gray-600 leading-relaxed">
                  {advantage.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 mt-16 -mb-8"></div>
              </motion.div>
            ))}
          </div>

          {/* Right side content - Featured statistic */}
          <div className="lg:col-span-6">
            <motion.div
              className="relative mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="flex items-start">
                <div className="pr-8 border-r border-gray-200">
                  <span className="text-7xl font-bold text-black">
                    {advantageData[0].years}
                  </span>
                  <div className="mt-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">
                    {advantageData[0].subtitle}
                  </div>
                </div>
                <div className="pl-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-5">
                    {advantageData[0].title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {advantageData[0].description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 mt-16 -mb-8"></div>
            </motion.div>

            {/* Additional stats that could be added */}
            <motion.div
              className="grid grid-cols-2 gap-8 mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-start">
                <span className="text-5xl font-bold text-black">98%</span>
                <div className="mt-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">
                  CLIENT SATISFACTION
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-5xl font-bold text-black">250+</span>
                <div className="mt-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">
                  PROJECTS COMPLETED
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* <motion.div
          className="mt-24 pt-12 border-t border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <p className="text-gray-600 italic">
                "Their strategic expertise and commitment to excellence have
                been instrumental in our growth. A true partner who delivers
                exceptional results."
              </p>
              <div className="mt-4">
                <h5 className="text-gray-900 font-bold">Jane Dawson</h5>
                <p className="text-gray-500 text-sm">
                  CEO, Enterprise Solutions Inc.
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <button className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-black hover:bg-gray-900 transition-colors duration-300">
                Learn More
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-8 block lg:hidden">
            <button className="w-full inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-black hover:bg-gray-900 transition-colors duration-300">
              Learn More
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
}
