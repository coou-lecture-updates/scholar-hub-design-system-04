import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
const Footer = () => {
  const {
    user
  } = useAuth();
  const currentYear = new Date().getFullYear();
  return <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 my-0 py-[10px]">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/lovable-uploads/64b237aa-13e5-47f2-898f-26a6977d2274.png" alt="COOU Logo" className="h-8 w-auto" />
              <div>
                <h3 className="text-lg font-bold">COOU School Updates</h3>
                <p className="text-gray-400 text-sm">Chukwuemeka Odumegwu Ojukwu University</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your comprehensive platform for academic updates, announcements, and resources 
              at Chukwuemeka Odumegwu Ojukwu University. Stay connected with the latest 
              information and manage your academic journey effectively.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323.875-.875 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.875.875 1.297 2.026 1.297 3.323 0 1.297-.49 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-gray-400 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              {user && <>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools" className="text-gray-400 hover:text-white transition-colors">
                      Tools
                    </Link>
                  </li>
                  <li>
                    <Link to="/timetable" className="text-gray-400 hover:text-white transition-colors">
                      Timetable
                    </Link>
                  </li>
                  <li>
                    <Link to="/community" className="text-gray-400 hover:text-white transition-colors">
                      Community
                    </Link>
                  </li>
                </>}
            </ul>
          </div>

          {/* Academic Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Academic</h3>
            <ul className="space-y-2">
              {user ? <>
                  <li>
                    <Link to="/course-updates" className="text-gray-400 hover:text-white transition-colors">
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/exam-updates" className="text-gray-400 hover:text-white transition-colors">
                      Exams
                    </Link>
                  </li>
                  <li>
                    <Link to="/lecture-updates" className="text-gray-400 hover:text-white transition-colors">
                      Lectures
                    </Link>
                  </li>
                  <li>
                    <Link to="/resources" className="text-gray-400 hover:text-white transition-colors">
                      Resources
                    </Link>
                  </li>
                </> : <>
                  <li>
                    <span className="text-gray-500">Courses</span>
                  </li>
                  <li>
                    <span className="text-gray-500">Exams</span>
                  </li>
                  <li>
                    <span className="text-gray-500">Lectures</span>
                  </li>
                  <li>
                    <span className="text-gray-500">Resources</span>
                  </li>
                </>}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} COOU School Updates. All rights reserved.
            </div>
            
          </div>
        </div>

      </div>
    </footer>;
};
export default Footer;