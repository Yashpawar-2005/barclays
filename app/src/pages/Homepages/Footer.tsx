import React from "react";
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="mr-3">
                <svg
                  className="w-8 h-8 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">LUXE</h2>
            </div>
            <p className="text-gray-300 mb-8 max-w-md">
              Crafting exceptional experiences through innovative design and
              premium quality. We've been setting industry standards since 2005,
              driven by a passion for excellence.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-900 p-3 rounded-full hover:bg-gray-800 transition duration-300"
              >
                <Instagram
                  size={18}
                  className="text-gray-300 hover:text-white"
                />
              </a>
              <a
                href="#"
                className="bg-gray-900 p-3 rounded-full hover:bg-gray-800 transition duration-300"
              >
                <Twitter size={18} className="text-gray-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="bg-gray-900 p-3 rounded-full hover:bg-gray-800 transition duration-300"
              >
                <Facebook
                  size={18}
                  className="text-gray-300 hover:text-white"
                />
              </a>
              <a
                href="#"
                className="bg-gray-900 p-3 rounded-full hover:bg-gray-800 transition duration-300"
              >
                <Linkedin
                  size={18}
                  className="text-gray-300 hover:text-white"
                />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Services</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Web Development
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  UI/UX Design
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Mobile Apps
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Consulting
                </a>
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Digital Marketing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin
                  size={18}
                  className="mt-1 mr-3 text-gray-400 flex-shrink-0"
                />
                <span className="text-gray-300">
                  123 Innovation Drive
                  <br />
                  San Francisco, CA 94107
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                <a
                  href="mailto:info@luxe.com"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  info@luxe.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section with centered copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} LUXE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
