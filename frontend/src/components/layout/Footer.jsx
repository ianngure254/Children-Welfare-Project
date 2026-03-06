
import { IoSchool, IoCall, IoMail, IoLocation, IoLogoFacebook, IoLogoTwitter, IoLogoInstagram, IoHeart } from 'react-icons/io5';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'Events', href: '#events' },
    { name: 'Admissions', href: '#admissions' },
    { name: 'Fees', href: '#fees' },
    { name: 'Volunteers', href: '#volunteers' },
    { name: 'Shop', href: '#shop' }
  ];

  const services = [
    'Quality Education',
    'Community Outreach',
    'Spiritual Growth',
    'Skills Development',
    'Family Support',
    'Youth Programs'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <IoSchool className="text-3xl text-orange-500 mr-3" />
              <h3 className="text-xl font-bold">Body of Christ Centre</h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Transforming lives through faith, education, and community service. 
              We are committed to providing quality education and spiritual growth for all.
            </p>
            <div className="flex items-center text-orange-500">
              <IoHeart className="mr-2" />
              <span className="font-medium">Made with love in Kenya</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <IoLocation className="mr-3 text-orange-500" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center text-gray-300">
                <IoCall className="mr-3 text-orange-500" />
                <span>+254 720 403 647</span>
              </li>
              <li className="flex items-center text-gray-300">
                <IoMail className="mr-3 text-orange-500" />
                <span>info@bodyofchristcentre.co.ke</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-400 mr-4">Follow Us:</span>
              <a 
                href="https://facebook.com/bodyofchristcentre" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="text-2xl" />
              </a>
              <a 
                href="https://twitter.com/bodyofchrist_ke" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-all duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="text-2xl" />
              </a>
              <a 
                href="https://instagram.com/bodyofchrist_centre" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="text-2xl" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                {currentYear} Body of Christ Centre. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Empowering communities through faith and education
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;