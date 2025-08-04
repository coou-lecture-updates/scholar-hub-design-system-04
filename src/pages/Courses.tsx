
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Star, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample course data
const allCourses = [
  {
    id: 1,
    title: 'Introduction to Data Science',
    category: 'Data Science',
    instructor: 'Dr. Sarah Johnson',
    level: 'Beginner',
    duration: '10 weeks',
    rating: 4.8,
    students: 1245,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    featured: true,
    tags: ['python', 'statistics', 'machine learning']
  },
  {
    id: 2,
    title: 'Modern Web Development',
    category: 'Programming',
    instructor: 'Prof. Michael Chen',
    level: 'Intermediate',
    duration: '8 weeks',
    rating: 4.7,
    students: 987,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    featured: true,
    tags: ['javascript', 'react', 'html/css']
  },
  {
    id: 3,
    title: 'Advanced Machine Learning',
    category: 'AI & ML',
    instructor: 'Dr. Alex Rivera',
    level: 'Advanced',
    duration: '12 weeks',
    rating: 4.9,
    students: 645,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    featured: true,
    tags: ['tensorflow', 'neural networks', 'deep learning']
  },
  {
    id: 4,
    title: 'Business Analytics Fundamentals',
    category: 'Business',
    instructor: 'Prof. Emma Wilson',
    level: 'Beginner',
    duration: '6 weeks',
    rating: 4.5,
    students: 823,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    featured: false,
    tags: ['excel', 'data analysis', 'visualization']
  },
  {
    id: 5,
    title: 'Principles of Organic Chemistry',
    category: 'Science',
    instructor: 'Dr. Robert Lewis',
    level: 'Intermediate',
    duration: '14 weeks',
    rating: 4.6,
    students: 512,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    featured: false,
    tags: ['chemistry', 'molecular structures', 'lab techniques']
  },
  {
    id: 6,
    title: 'Introduction to Psychology',
    category: 'Social Sciences',
    instructor: 'Dr. Lisa Campos',
    level: 'Beginner',
    duration: '8 weeks',
    rating: 4.8,
    students: 1534,
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    featured: false,
    tags: ['psychology', 'human behavior', 'cognitive science']
  }
];

// Category and level options for filtering
const categories = ['All Categories', 'Data Science', 'Programming', 'AI & ML', 'Business', 'Science', 'Social Sciences'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  
  // Filter courses based on search term, category, and level
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  // Group courses for tabs
  const featuredCourses = filteredCourses.filter(course => course.featured);
  const popularCourses = [...filteredCourses].sort((a, b) => b.students - a.students);
  const highestRated = [...filteredCourses].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold">Explore Our Courses</h1>
            <p className="mt-2 text-lg opacity-90">
              Discover a wide range of courses designed to enhance your knowledge and skills
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="w-full lg:w-1/3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex-grow lg:flex-grow-0 lg:flex-shrink-0 grid grid-cols-2 gap-4 w-full lg:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-md px-4 py-2 bg-white text-gray-800 cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="border rounded-md px-4 py-2 bg-white text-gray-800 cursor-pointer"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <Button variant="outline" className="lg:ml-auto">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
            
            {/* Active filters display */}
            {(selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels' || searchTerm) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory !== 'All Categories' && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All Categories')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                  </Badge>
                )}
                {selectedLevel !== 'All Levels' && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {selectedLevel}
                    <button onClick={() => setSelectedLevel('All Levels')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                  </Badge>
                )}
                
                {(selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels' || searchTerm) && (
                  <button 
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setSelectedLevel('All Levels');
                      setSearchTerm('');
                    }}
                    className="text-sm text-primary hover:underline ml-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Course count */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-700">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select className="border rounded-md px-3 py-1 text-sm bg-white text-gray-800 cursor-pointer">
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {/* Courses tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="rated">Highest Rated</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="featured" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {featuredCourses.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">No featured courses match your filters</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rated" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {highestRated.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Course card component
const CourseCard = ({ course }) => (
  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
    <div className="h-48 overflow-hidden">
      <img 
        src={course.image} 
        alt={course.title} 
        className="w-full h-full object-cover transition-transform hover:scale-105"
      />
    </div>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {course.category}
        </Badge>
        <Badge variant="outline" className="bg-secondary/30 text-gray-700 border-secondary/20">
          {course.level}
        </Badge>
      </div>
      <h3 className="font-bold text-xl mt-2">{course.title}</h3>
      <p className="text-gray-600">{course.instructor}</p>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{course.students.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span>{course.rating}</span>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {course.tags.map(tag => (
          <Badge variant="secondary" key={tag} className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Link to={`/courses/${course.id}`} className="w-full">
        <Button className="w-full">View Course</Button>
      </Link>
    </CardFooter>
  </Card>
);

export default Courses;
