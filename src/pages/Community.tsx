
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Community = () => {
  // Fixed the arithmetic operation error by using proper numeric types
  const totalMembers = 5280;
  const activeDiscussions = 132;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-blue-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Join Our Academic Community
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Connect with students, educators, and researchers from around the world. 
                Share knowledge, collaborate on projects, and grow together.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="btn bg-primary text-white px-8 py-3 rounded-md shadow-md hover:bg-primary/90 transition-colors">
                  Join Now
                </button>
                <button className="btn border border-gray-300 px-8 py-3 rounded-md shadow-md hover:bg-gray-50 transition-colors">
                  Browse Discussions
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-lg bg-blue-50">
                <div className="text-3xl font-bold text-primary mb-2">{totalMembers.toLocaleString()}</div>
                <div className="text-gray-700">Community Members</div>
              </div>
              <div className="p-6 rounded-lg bg-green-50">
                <div className="text-3xl font-bold text-green-600 mb-2">{activeDiscussions}</div>
                <div className="text-gray-700">Active Discussions</div>
              </div>
              <div className="p-6 rounded-lg bg-purple-50">
                <div className="text-3xl font-bold text-purple-600 mb-2">48</div>
                <div className="text-gray-700">Study Groups</div>
              </div>
              <div className="p-6 rounded-lg bg-yellow-50">
                <div className="text-3xl font-bold text-yellow-600 mb-2">3.2K</div>
                <div className="text-gray-700">Monthly Contributions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Discussion Forums */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Discussion Forums</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Academic Research",
                  description: "Share your research, get feedback, and collaborate with others",
                  members: 1250,
                  topics: 324
                },
                {
                  title: "Study Techniques",
                  description: "Discuss effective study methods and productivity tips",
                  members: 945,
                  topics: 256
                },
                {
                  title: "Career Development",
                  description: "Get advice on career paths and professional development",
                  members: 830,
                  topics: 185
                },
                {
                  title: "Educational Technology",
                  description: "Explore the latest in educational tech and digital learning tools",
                  members: 788,
                  topics: 210
                },
                {
                  title: "Academic Writing",
                  description: "Improve your writing skills for papers, theses, and publications",
                  members: 712,
                  topics: 164
                },
                {
                  title: "Subject Help",
                  description: "Get assistance with specific subjects and course material",
                  members: 1456,
                  topics: 578
                }
              ].map((forum, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{forum.title}</h3>
                  <p className="text-gray-600 mb-4">{forum.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{forum.members} members</span>
                    <span>{forum.topics} topics</span>
                  </div>
                  <button className="mt-4 text-primary hover:underline text-sm font-medium">
                    Join Forum →
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Browse All Forums
              </button>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Upcoming Community Events</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: "Research Methodology Workshop",
                  date: "May 15, 2025",
                  time: "2:00 PM - 4:00 PM",
                  location: "Virtual",
                  host: "Dr. Sarah Johnson"
                },
                {
                  title: "Academic Writing Masterclass",
                  date: "May 22, 2025",
                  time: "10:00 AM - 12:00 PM",
                  location: "Virtual",
                  host: "Prof. Michael Roberts"
                },
                {
                  title: "Graduate School Application Panel",
                  date: "June 5, 2025",
                  time: "3:00 PM - 5:00 PM",
                  location: "Virtual",
                  host: "Career Services Team"
                },
                {
                  title: "Student Research Symposium",
                  date: "June 18-20, 2025",
                  time: "All Day",
                  location: "Main Campus",
                  host: "Research Committee"
                }
              ].map((event, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Hosted by: {event.host}</span>
                    </div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm">
                    Register
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                View All Events
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
