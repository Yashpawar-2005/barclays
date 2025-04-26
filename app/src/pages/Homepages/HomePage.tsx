import React, { useState } from "react";
import Footer from "./Footer";
import FAQSection from "./FAQ";
import WhatWeDoSection from "./what";
import WhyChooseUsSection from "./why";
import FeaturesSection from "./feature";

const HeroSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="overflow-x-hidden bg-gray-50 relative">
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 transition-opacity duration-300 ease-in-out lg:hidden"
          onClick={toggleMenu}
        />
      )}

      <header className="relative py-4 md:py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            <div className="flex-shrink-0">
              <a
                href="#"
                title=""
                className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                <img
                  className="w-auto h-8"
                  src="https://d33wubrfki0l68.cloudfront.net/682a555ec15382f2c6e7457ca1ef48d8dbb179ac/f8cd3/images/logo.svg"
                  alt="Logo"
                />
              </a>
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                className="text-gray-900 z-30"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile menu */}
            <div
              className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out lg:hidden ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <button
                    onClick={toggleMenu}
                    className="ml-auto block text-gray-500"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col p-4 space-y-6">
                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 transition-all duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 transition-all duration-200"
                  >
                    What We Do
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 transition-all duration-200"
                  >
                    Why Choose US
                  </a>
                  <a
                    href="login"
                    className="px-5 py-2 text-base font-semibold leading-7 text-white transition-all duration-200 bg-gray-900 border border-gray-900 rounded-xl text-center"
                  >
                    Login
                  </a>
                </div>
              </div>
            </div>

            <div className="hidden lg:absolute lg:inset-y-0 lg:flex lg:items-center lg:justify-center lg:space-x-12 lg:-translate-x-1/2 lg:left-1/2">
              <a
                href="#"
                title=""
                className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                Features
              </a>
              <a
                href="#"
                title=""
                className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                What We Do
              </a>
              <a
                href="#"
                title=""
                className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                Why Choose Us
              </a>
              <a
                href="#"
                title=""
                className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                FAQs
              </a>
            </div>

            <div className="hidden lg:flex lg:items-center lg:justify-center">
              <a
                href="login"
                title=""
                role="button"
                className="px-5 py-2 text-base font-semibold leading-7 text-gray-900 transition-all duration-200 bg-transparent border border-gray-900 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-12 sm:py-16 lg:pt-20 xl:pb-0">
        <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex px-4 py-2 text-base text-gray-900 border border-gray-200 rounded-full font-pj">
              Made by Developers, for Developers
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">
              Quality resources shared by the community
            </h1>
            <p className="max-w-md mx-auto mt-6 text-base leading-7 text-gray-600 font-inter">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vehicula
              massa in enim luctus. Rutrum arcu.
            </p>

            <div className="relative inline-flex mt-10 group">
              <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt" />

              <a
                href="login"
                title=""
                role="button"
                className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <img
            className="object-cover object-top w-full h-auto mx-auto scale-150 2xl:max-w-screen-2xl xl:scale-100"
            src="https://d33wubrfki0l68.cloudfront.net/54780decfb9574945bc873b582cdc6156144a2ba/d9fa1/images/hero/4/illustration.png"
            alt="Hero illustration"
          />
        </div>
      </section>
      <FeaturesSection></FeaturesSection>
      <WhatWeDoSection></WhatWeDoSection>
      <WhyChooseUsSection></WhyChooseUsSection>
      <FAQSection></FAQSection>
      <Footer></Footer>
    </div>
  );
};

export default HeroSection;
