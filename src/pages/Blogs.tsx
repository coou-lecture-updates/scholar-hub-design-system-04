
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Tag, Calendar, User, MessageSquare, Eye } from 'lucide-react';

const Blogs = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample blog data
  const blogs = [
    {
      id: 1,
      title: "How to Prepare for Final Exams: A Comprehensive Guide",
      excerpt: "Explore effective study techniques, time management strategies, and stress reduction methods to ace your final exams.",
      author: "Dr. James Wilson",
      date: "2025-04-28",
      category: "Study Tips",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      views: 1256,
      comments: 24
    },
    {
      id: 2,
      title: "Campus Life: Making the Most of Your College Experience",
      excerpt: "Discover how to balance academics, social life, and extracurricular activities to create a fulfilling college experience.",
      author: "Student Council",
      date: "2025-04-25",
      category: "Campus Life",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      views: 845,
      comments: 15
    },
    {
      id: 3,
      title: "Research Opportunities for Undergraduate Students",
      excerpt: "Learn about various research programs, fellowships, and how to approach professors for research assistant positions.",
      author: "Research Department",
      date: "2025-04-22",
      category: "Research",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb",
      views: 623,
      comments: 9
    },
    {
      id: 4,
      title: "Career Planning: From College to Professional Life",
      excerpt: "Strategic advice on building your resume, networking, and preparing for the transition from student to professional.",
      author: "Career Services",
      date: "2025-04-20",
      category: "Career",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093",
      views: 789,
      comments: 18
    },
    {
      id: 5,
      title: "Mental Health Resources for Students",
      excerpt: "An overview of mental health services available on campus and strategies for maintaining well-being during stressful academic periods.",
      author: "Wellness Center",
      date: "2025-04-18",
      category: "Health & Wellness",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
      views: 1102,
      comments: 32
    },
    {
      id: 6,
      title: "Technology Tools for Enhanced Learning",
      excerpt: "A curated list of apps, software, and online resources to boost productivity and learning effectiveness.",
      author: "IT Department",
      date: "2025-04-15",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1581092335397-9fa341136fe0",
      views: 578,
      comments: 7
    }
  ];
  
  // Get all unique categories
  const categories = ['all', ...new Set(blogs.map(blog => blog.category))];
  
  // Filter blogs based on category and search query
  const filteredBlogs = blogs
    .filter(blog => activeCategory === 'all' || blog.category === activeCategory)
    .filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
      blog.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">School Blogs</h2>
            
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <Tag size={14} className="text-primary mr-1" />
                    <span className="text-xs text-primary font-medium">{blog.category}</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blog.title}</h3>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{blog.author}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <button className="text-primary hover:underline text-sm">
                      Read More
                    </button>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        <span>{blog.views}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        <span>{blog.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-10 text-center">
              <div className="flex justify-center mb-3">
                <Search size={48} className="text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">No blogs found matching your search</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }} 
                className="text-primary text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Blogs;
