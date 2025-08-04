
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, User, ArrowRight, Search, BookOpen, Clock, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PublicBlogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    
    // Set up realtime subscription
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

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      // Only fetch published blogs
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }
      
      console.log('Fetched blog posts:', data);
      const allBlogs = data || [];
      setBlogs(allBlogs);
      
      // Set featured blogs (latest 3)
      setFeaturedBlogs(allBlogs.slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Extract tags from blog content
  const getTagsFromContent = (content: string): string[] => {
    if (!content) return ['General'];
    
    const tags: string[] = [];
    
    if (content.toLowerCase().includes('academic')) tags.push('Academic');
    if (content.toLowerCase().includes('research')) tags.push('Research');
    if (content.toLowerCase().includes('event')) tags.push('Events');
    if (content.toLowerCase().includes('faculty')) tags.push('Faculty');
    if (content.toLowerCase().includes('student')) tags.push('Students');
    if (content.toLowerCase().includes('campus')) tags.push('Campus Life');
    
    return tags.length > 0 ? tags : ['General'];
  };

  // Get all unique tags for filter
  const allTags = Array.from(new Set(
    blogs.flatMap(blog => getTagsFromContent(blog.content || ''))
  )).sort();

  // Filter blogs based on search term and selected tag (excluding featured)
  const filteredBlogs = blogs.filter(blog => {
    const isNotFeatured = !featuredBlogs.some(featured => featured.id === blog.id);
    const matchesSearch = 
      (blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       blog.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       blog.content?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!selectedTag) return matchesSearch && isNotFeatured;
    
    const blogTags = getTagsFromContent(blog.content || '');
    return matchesSearch && blogTags.includes(selectedTag) && isNotFeatured;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section - Compact size */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6" />
                <span className="text-blue-200 font-medium">University News & Updates</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Stay Connected with COOU</h1>
              <p className="text-blue-100 text-lg md:text-xl mb-6 leading-relaxed">
                Discover the latest happenings, academic updates, and campus life stories
              </p>
              <div className="relative max-w-2xl mx-auto">
                <Input 
                  type="text"
                  placeholder="Search articles, news, and updates..."
                  className="pl-12 py-3 text-base bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Stories Section - Redesigned Layout */}
        {featuredBlogs.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-700 p-2 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
                <p className="text-gray-600">Don't miss these important updates</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Featured Article - Large Left */}
              <div className="lg:col-span-2">
                {featuredBlogs[0] && (
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg group">
                    <div className="relative h-96 overflow-hidden">
                      <img 
                        src={featuredBlogs[0].image_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop&crop=faces`}
                        alt={featuredBlogs[0].title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <Badge className="bg-blue-700 hover:bg-blue-800 mb-4 px-3 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                        <h3 className="text-3xl font-bold mb-3 line-clamp-2 leading-tight">{featuredBlogs[0].title}</h3>
                        <p className="text-gray-200 line-clamp-2 mb-4 text-lg leading-relaxed">{featuredBlogs[0].summary}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>{featuredBlogs[0].author || 'COOU Admin'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{formatDate(featuredBlogs[0].created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardFooter className="p-6 bg-white">
                      <Link to={`/blogs/${featuredBlogs[0].id}`} className="w-full">
                        <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3">
                          Read Full Story <ArrowRight size={18} className="ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )}
              </div>
              
              {/* Side Featured Articles - Stacked Right */}
              <div className="space-y-6">
                {featuredBlogs.slice(1, 3).map((blog, index) => (
                  <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md group">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={blog.image_url || `https://images.unsplash.com/photo-${index === 0 ? '1488590528505-98d2b5aba04b' : '1581091226825-a6a2a5aee158'}?w=400&h=200&fit=crop`}
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <CardHeader className="p-5">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg leading-tight hover:text-blue-700 transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {blog.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-5 pt-0">
                      <Link to={`/blogs/${blog.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300">
                          Read More <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Tags filter */}
        <div className="container mx-auto px-4 py-6 border-t bg-white">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 py-2 mr-2">Filter by topic:</span>
            {allTags.map((tag, index) => (
              <Button
                key={index}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagFilter(tag)}
                className={`${selectedTag === tag ? "bg-blue-700 hover:bg-blue-800" : "hover:bg-blue-50 hover:border-blue-300"} transition-all`}
              >
                <Tag className="mr-2 h-3 w-3" />
                {tag}
              </Button>
            ))}
            {selectedTag && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear filter
              </Button>
            )}
          </div>
        </div>
        
        {/* All Blog posts - Enhanced Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Articles</h2>
            <p className="text-gray-600">Browse through our latest posts and updates</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Posts Found</h2>
              <p className="text-gray-600">
                {searchTerm || selectedTag ? 
                  "No posts match your search criteria. Try different keywords or filters." : 
                  "There are no additional blog posts available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden hover:shadow-xl transition-all duration-500 border-0 shadow-md group bg-white">
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={blog.image_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&sig=${blog.id}`}
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop&sig=${blog.id}`;
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
                    
                    <CardTitle className="line-clamp-2 text-xl mb-3 leading-tight group-hover:text-blue-700 transition-colors">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 leading-relaxed">
                      {blog.summary}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardFooter className="px-6 pb-6">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-2">
                        {getTagsFromContent(blog.content || '').slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            onClick={() => handleTagFilter(tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link to={`/blogs/${blog.id}`}>
                        <Button variant="ghost" className="p-0 h-auto text-blue-700 hover:text-blue-800 font-medium">
                          Read More <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicBlogs;
