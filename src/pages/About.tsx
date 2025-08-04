import React, { useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, ChevronRight } from 'lucide-react';

const About = () => {
  // Create a ref for the footer section
  const footerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the footer contact form
  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="relative">
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img 
              src="/lovable-uploads/bbe59ce5-f0b7-443f-922c-4621c39fd828.png" 
              alt="COOU Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/60"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">About Our University</h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto">
                Dedicated to academic excellence and innovation in education
              </p>
            </div>
          </div>
        </div>
        
        {/* University information */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Chukwuemeka Odumegwu Ojukwu University</h2>
                <p className="text-gray-700 mb-6">
                  Chukwuemeka Odumegwu Ojukwu University (COOU), formerly Anambra State University, 
                  is a public university with its main campus in Uli, Anambra State, Nigeria. 
                  The university also operates a campus in Igbariam. Named after the late Biafran 
                  leader, Chukwuemeka Odumegwu Ojukwu, our institution is committed to providing 
                  high-quality education and promoting research excellence.
                </p>
                <p className="text-gray-700 mb-6">
                  Since its establishment, COOU has grown to become one of the leading universities 
                  in Nigeria, offering a wide range of undergraduate and postgraduate programs across 
                  various disciplines. Our mission is to nurture talented students into skilled professionals 
                  who will contribute positively to society and drive innovation in their respective fields.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-blue-700 hover:bg-blue-800">Our Programs</Button>
                  <Button variant="outline">University History</Button>
                  <Button variant="outline" onClick={scrollToContact}>Contact Us</Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/lovable-uploads/497e0a50-40be-4200-b5d8-b57acd658ca7.png" 
                  alt="COOU Gate" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission and Vision */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission and Vision</h2>
              <div className="w-20 h-1 bg-blue-700 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700">
                  To provide high-quality education that empowers students with knowledge, skills, 
                  and values to excel in their chosen fields and make meaningful contributions to society. 
                  We are committed to fostering a culture of innovation, critical thinking, and ethical leadership.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700">
                  To be a world-class university recognized for excellence in teaching, research, and 
                  community service. We aim to be the leading institution in Nigeria for innovative education 
                  and research that addresses local and global challenges while promoting sustainable development.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Faculties */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Faculties</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Explore our diverse academic units offering quality education across various disciplines
              </p>
              <div className="w-20 h-1 bg-blue-700 mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Faculty of Arts', count: '8 Departments' },
                { name: 'Faculty of Science', count: '10 Departments' },
                { name: 'Faculty of Management Sciences', count: '6 Departments' },
                { name: 'Faculty of Social Sciences', count: '7 Departments' },
                { name: 'Faculty of Education', count: '9 Departments' },
                { name: 'Faculty of Engineering', count: '5 Departments' },
                { name: 'Faculty of Law', count: '1 Department' },
                { name: 'Faculty of Agriculture', count: '6 Departments' },
                { name: 'Faculty of Medicine', count: '4 Departments' }
              ].map((faculty, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faculty.name}</h3>
                  <p className="text-gray-600 text-sm">{faculty.count}</p>
                  <div className="mt-4">
                    <Button variant="link" className="p-0 h-auto text-blue-700">
                      Learn More <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Information - Keep only the information, remove the form */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p className="mb-8 max-w-2xl">
              Have questions about our university? We're here to help. Feel free to reach out to us 
              through any of the following channels, or use the contact form in the footer section below.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Main Campus - Uli</h3>
                    <p className="text-gray-300">PMB 02, Uli, Anambra State, Nigeria</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Igbariam Campus</h3>
                    <p className="text-gray-300">PMB 03, Igbariam, Anambra State, Nigeria</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-300">+234-XXXX-XXXX-XXX</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-300">info@coou.edu.ng</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Globe className="mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Website</h3>
                    <p className="text-gray-300">www.coou.edu.ng</p>
                  </div>
                </div>
                
                <Button 
                  onClick={scrollToContact} 
                  className="bg-blue-700 hover:bg-blue-800 mt-4"
                >
                  Go to Contact Form
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Pass the ref to Footer for scrolling */}
      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  );
};

export default About;
