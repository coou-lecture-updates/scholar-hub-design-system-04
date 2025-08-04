
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Educational Resources Hub
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Access a wealth of academic materials, research papers, study guides, 
                and learning tools to support your educational journey.
              </p>
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full px-4 py-3 pl-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Resource Categories</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Lecture Notes",
                  icon: "📝",
                  count: 256,
                  color: "bg-blue-50"
                },
                {
                  title: "Research Papers",
                  icon: "📄",
                  count: 189,
                  color: "bg-green-50"
                },
                {
                  title: "Study Guides",
                  icon: "📚",
                  count: 124,
                  color: "bg-yellow-50"
                },
                {
                  title: "Video Tutorials",
                  icon: "🎥",
                  count: 98,
                  color: "bg-red-50"
                },
                {
                  title: "Practice Tests",
                  icon: "✅",
                  count: 75,
                  color: "bg-purple-50"
                },
                {
                  title: "E-Books",
                  icon: "📱",
                  count: 142,
                  color: "bg-indigo-50"
                },
                {
                  title: "Datasets",
                  icon: "📊",
                  count: 67,
                  color: "bg-pink-50"
                },
                {
                  title: "Case Studies",
                  icon: "🔍",
                  count: 53,
                  color: "bg-orange-50"
                }
              ].map((category, index) => (
                <div key={index} className={`${category.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                  <p className="text-gray-600 text-sm">{category.count} resources</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Resources</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Introduction to Data Science",
                  type: "Course Materials",
                  author: "Prof. Jane Smith",
                  date: new Date("2025-03-15"),
                  downloads: 1245,
                  description: "Comprehensive lecture notes and practice problems for the introductory data science course."
                },
                {
                  title: "Advanced Research Methods",
                  type: "Study Guide",
                  author: "Dr. Michael Johnson",
                  date: new Date("2025-02-28"),
                  downloads: 956,
                  description: "A detailed guide to research methodologies across various disciplines with practical examples."
                },
                {
                  title: "Quantum Physics Simplified",
                  type: "Video Series",
                  author: "Dr. Robert Chen",
                  date: new Date("2025-03-02"),
                  downloads: 782,
                  description: "10-part video series explaining complex quantum physics concepts using simple analogies."
                },
                {
                  title: "Machine Learning Applications",
                  type: "Case Studies",
                  author: "AI Research Team",
                  date: new Date("2025-03-10"),
                  downloads: 654,
                  description: "Real-world applications of machine learning algorithms with code examples and results."
                },
                {
                  title: "Modern Literature Analysis",
                  type: "E-Book",
                  author: "Dr. Emily Wilson",
                  date: new Date("2025-02-20"),
                  downloads: 512,
                  description: "Critical analysis of 21st century literature with themes, motifs, and cultural context."
                },
                {
                  title: "Statistical Methods in Biology",
                  type: "Practice Tests",
                  author: "Prof. Thomas Lee",
                  date: new Date("2025-03-05"),
                  downloads: 435,
                  description: "Collection of practice problems and solutions for biostatistics applications."
                }
              ].map((resource, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {resource.type}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold mt-3 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{resource.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {/* Fixed the date format issue by using proper DateTimeFormatOptions */}
                      <span>{resource.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md text-sm font-medium">
                    Download Resource
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium">
                Browse All Resources
              </button>
            </div>
          </div>
        </section>

        {/* Contributor Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Contribute Your Resources</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
              Share your academic materials with our community. Your contributions help fellow students and researchers expand their knowledge.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 mb-6 md:mb-0">
                  <img src="https://images.unsplash.com/photo-1583468367534-c0cd11187eb8" alt="Share knowledge" className="rounded-lg shadow-md" />
                </div>
                <div className="md:w-2/3 md:pl-8">
                  <h3 className="text-2xl font-semibold mb-4">Become a Contributor</h3>
                  <p className="text-gray-600 mb-6">
                    Upload your lecture notes, study guides, practice tests or other educational materials to help others in their academic journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium">
                      Upload Resource
                    </button>
                    <button className="px-6 py-3 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
