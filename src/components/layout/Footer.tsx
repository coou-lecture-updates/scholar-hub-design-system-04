import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-5">
              <img 
                src="/lovable-uploads/64b237aa-13e5-47f2-898f-26a6977d2274.png" 
                alt="COOU Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-lg font-bold text-white">CoouConnect</h3>
                <p className="text-gray-400 text-sm">University Portal</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your comprehensive platform for academic updates, announcements, and resources 
              at Chukwuemeka Odumegwu Ojukwu University.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-8 h-0.5 bg-primary mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/blogs', label: 'News & Blogs' },
                { to: '/events', label: 'Events' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-white transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-400 hover:text-white transition-colors flex items-center group"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/community" 
                      className="text-gray-400 hover:text-white transition-colors flex items-center group"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Community
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Academic Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-8 h-0.5 bg-primary mr-3"></span>
              Academic
            </h3>
            <ul className="space-y-3">
              {user ? (
                <>
                  {[
                    { to: '/course-updates', label: 'Courses' },
                    { to: '/exam-updates', label: 'Examinations' },
                    { to: '/lecture-updates', label: 'Lectures' },
                    { to: '/timetable', label: 'Timetable' },
                    { to: '/resources', label: 'Resources' },
                    { to: '/tools', label: 'Student Tools' },
                  ].map((link) => (
                    <li key={link.to}>
                      <Link 
                        to={link.to} 
                        className="text-gray-400 hover:text-white transition-colors flex items-center group"
                      >
                        <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {['Courses', 'Examinations', 'Lectures', 'Timetable', 'Resources'].map((item) => (
                    <li key={item}>
                      <span className="text-gray-500 flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2 opacity-50" />
                        {item}
                      </span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-8 h-0.5 bg-primary mr-3"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    Uli Campus, Anambra State<br />
                    Igbariam Campus, Anambra State
                  </p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <a href="tel:+2348000000000" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <a href="mailto:info@coou.edu.ng" className="text-gray-400 hover:text-white transition-colors text-sm">
                  info@coou.edu.ng
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} CoouConnect. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
