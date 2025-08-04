
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, User, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  author: string;
  created_at: string;
  image_url: string;
}

const FeaturedBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        setBlogs(data as BlogPost[]);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();

    // Set up realtime subscription for blog updates
    const blogSubscription = supabase
      .channel('public:blog_posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blog_posts' }, 
        () => {
          console.log('Blog posts changed, refreshing data');
          fetchBlogs();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(blogSubscription);
    };
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest University News</h2>
              <p className="text-gray-600">Stay updated with the latest happenings at COOU</p>
            </div>
          </div>
          <Link to="/blogs">
            <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300">
              All News & Updates
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No news articles available at this time.</p>
            <Link to="/blogs">
              <Button>View All News</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <Card key={blog.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md group">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={blog.image_url || `https://images.unsplash.com/photo-${index === 0 ? '1649972904349-6e44c42644a7' : index === 1 ? '1488590528505-98d2b5aba04b' : '1581091226825-a6a2a5aee158'}?w=400&h=300&fit=crop`}
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&sig=${blog.id}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{blog.author || 'COOU Admin'}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl line-clamp-2 leading-tight mb-3 group-hover:text-blue-700 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 leading-relaxed">
                    {blog.summary}
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex justify-between items-center">
                    <Link to={`/blogs/${blog.id}`}>
                      <Button variant="link" className="p-0 h-auto font-medium text-blue-700 hover:text-blue-800">
                        Read More <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBlogs;
