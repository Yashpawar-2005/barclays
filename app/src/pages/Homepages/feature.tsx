import { useState } from "react";
import { motion } from "framer-motion";

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function FeaturesSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Premium SVG icons
  const icons = {
    strategy: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    analytics: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    integration: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
    innovation: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    support: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM6.75 9.75a2 2 0 117.5 0 2 2 0 01-7.5 0z"
        />
      </svg>
    ),
    scalable: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
        />
      </svg>
    ),
  };

  const featureData: FeatureItem[] = [
    {
      id: 1,
      title: "Personalized Strategy",
      description:
        "Tailored approaches designed specifically for your unique business challenges and objectives, ensuring solutions that deliver maximum impact.",
      icon: icons.strategy,
    },
    {
      id: 2,
      title: "Advanced Analytics",
      description:
        "Data-driven insights that illuminate opportunities and inform strategic decisions, turning complex information into actionable intelligence.",
      icon: icons.analytics,
    },
    {
      id: 3,
      title: "Seamless Integration",
      description:
        "Solutions that work harmoniously with your existing systems and workflows, minimizing disruption while maximizing efficiency gains.",
      icon: icons.integration,
    },
    {
      id: 4,
      title: "Continuous Innovation",
      description:
        "Ongoing refinement and enhancement of your solutions, keeping your business at the cutting edge of industry developments.",
      icon: icons.innovation,
    },
    {
      id: 5,
      title: "Dedicated Support",
      description:
        "Responsive, knowledgeable assistance from professionals who understand your business and are committed to your ongoing success.",
      icon: icons.support,
    },
    {
      id: 6,
      title: "Scalable Solutions",
      description:
        "Frameworks that grow and adapt with your business, providing continuous value through every stage of your organization's evolution.",
      icon: icons.scalable,
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-6">
            CAPABILITIES
          </h2>
          <h3 className="text-4xl font-light text-gray-900 sm:text-5xl max-w-4xl">
            Exceptional <span className="font-bold">Features</span>
          </h3>
          <div className="w-20 h-px bg-black mt-8"></div>

          <div className="mt-12 max-w-2xl">
            <p className="text-gray-600 leading-relaxed">
              Our comprehensive suite of features is designed to deliver
              unparalleled value and performance. Each element has been
              meticulously crafted to address your most critical business needs.
            </p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureData.map((feature) => (
            <motion.div
              key={feature.id}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * feature.id }}
              viewport={{ once: true, margin: "-50px" }}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                className="p-8 border-2 border-gray-200 h-full rounded-lg shadow-sm"
                animate={{
                  borderColor: hoveredId === feature.id ? "#000000" : "#E5E7EB",
                  backgroundColor:
                    hoveredId === feature.id ? "#FAFAFA" : "#FFFFFF",
                  y: hoveredId === feature.id ? -5 : 0,
                  boxShadow:
                    hoveredId === feature.id
                      ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className="p-3 rounded-full bg-gray-50 inline-flex mb-6 text-gray-700">
                  {feature.icon}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h4>

                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Additional features section at bottom */}
        {/* <div className="mt-24 border-t border-gray-200 pt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h5 className="font-bold text-lg mb-4">Globally Recognized</h5>
            <p className="text-gray-600">
              Our solutions meet international standards for excellence and have
              earned recognition from leading industry authorities.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Future-Proof Technology</h5>
            <p className="text-gray-600">
              We build with scalability and adaptability in mind, ensuring your
              investment continues to deliver value for years to come.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Measurable Outcomes</h5>
            <p className="text-gray-600">
              Every feature is designed with clear metrics for success, allowing
              you to track ROI and demonstrate value to stakeholders.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
