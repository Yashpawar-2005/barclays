import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How to create an account?",
    answer:
      "Creating an account is simple. Navigate to the sign-up page, enter your email address, create a password, and follow the verification steps. Once verified, you'll have full access to your new account and all its features.",
  },
  {
    id: 2,
    question: "How can I make payment using PayPal?",
    answer:
      "To pay with PayPal, select PayPal as your payment method during checkout. You'll be redirected to PayPal to complete your payment securely. After confirming the payment, you'll be returned to our site with a confirmation of your transaction.",
  },
  {
    id: 3,
    question: "Can I cancel my plan?",
    answer:
      "Yes, you can cancel your plan at any time. Go to your account settings, select 'Subscription', and click on 'Cancel Plan'. Your subscription will remain active until the end of the current billing period, and you won't be charged afterward.",
  },
  {
    id: 4,
    question: "How can I reach to support?",
    answer:
      "Our support team is available 24/7. You can contact us through live chat on our website, email us at support@example.com, or call our customer service line at (555) 123-4567. We typically respond to all inquiries within 24 hours.",
  },
  {
    id: 5,
    question: "What is your refund policy?",
    answer:
      "We offer a 30-day money-back guarantee on all our plans. If you're not satisfied with our service within the first 30 days, you can request a full refund with no questions asked. Simply contact our support team to process your refund.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to commonly asked questions about our services and
          features.
        </p>
      </div>

      <div className="space-y-5">
        {faqData.map((faq) => (
          <motion.div
            key={faq.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
              hoveredIndex === faq.id ? "shadow-md transform scale-[1.01]" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(faq.id)}
            onMouseLeave={() => setHoveredIndex(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <button
              className={`w-full px-6 py-5 flex justify-between items-center text-left transition-colors focus:outline-none ${
                hoveredIndex === faq.id ? "bg-gray-50" : ""
              }`}
              onClick={() => toggleAccordion(faq.id)}
              aria-expanded={activeIndex === faq.id}
            >
              <span
                className={`text-lg font-medium ${
                  activeIndex === faq.id ? "text-black" : "text-gray-900"
                } transition-colors duration-300`}
              >
                {faq.question}
              </span>
              <motion.div
                animate={{
                  rotate: activeIndex === faq.id ? 180 : 0,
                  color:
                    activeIndex === faq.id
                      ? "#000000"
                      : hoveredIndex === faq.id
                      ? "#333333"
                      : "#666666",
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </button>

            <AnimatePresence>
              {activeIndex === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="relative">
                    <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="px-6 pb-6 text-gray-600 pt-5">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
