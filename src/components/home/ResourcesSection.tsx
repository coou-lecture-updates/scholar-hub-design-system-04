
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, FileText, BookMarked, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const resources = [
  {
    id: 1,
    title: 'Academic Articles',
    description: 'Access peer-reviewed articles from top journals across various disciplines',
    icon: FileText,
    path: '/resources/articles',
    count: 2500
  },
  {
    id: 2,
    title: 'E-Books',
    description: 'Comprehensive collection of academic books and reference materials',
    icon: BookOpen,
    path: '/resources/books',
    count: 1800
  },
  {
    id: 3,
    title: 'Research Papers',
    description: 'Latest research papers from leading academic institutions worldwide',
    icon: BookMarked,
    path: '/resources/papers',
    count: 3200
  },
  {
    id: 4,
    title: 'Video Lectures',
    description: 'Recorded lectures from professors and industry experts on key topics',
    icon: Video,
    path: '/resources/videos',
    count: 950
  }
];

const ResourcesSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Academic Resources</h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our extensive collection of scholarly resources to enhance your learning experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <Link to={resource.path} key={resource.id}>
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <resource.icon className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium text-gray-500">{resource.count.toLocaleString()}+ items</span>
                  </div>
                  <h3 className="font-bold text-xl mt-4">{resource.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{resource.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
