
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Calendar, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CustomLink {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'event' | 'blog';
  summary?: string;
}

const HeroSection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    // Fetch custom links from the database
    const fetchCustomLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_links')
          .select('*')
          .eq('is_active', true)
          .eq('category', 'hero')
          .order('name');
          
        if (error) {
          console.error('Error fetching custom links:', error);
          return;
        }
        
        if (data) {
          setCustomLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch custom links:', err);
      }
    };
    
    fetchCustomLinks();
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      // Search courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description')
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(3);

      if (courses) {
        results.push(...courses.map(course => ({
          id: course.id,
          title: course.title,
          type: 'course' as const,
          summary: course.description
        })));
      }

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description')
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(3);

      if (events) {
        results.push(...events.map(event => ({
          id: event.id,
          title: event.title,
          type: 'event' as const,
          summary: event.description
        })));
      }

      // Search blogs
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, summary')
        .eq('published', true)
        .or(`title.ilike.%${query}%, summary.ilike.%${query}%`)
        .limit(3);

      if (blogs) {
        results.push(...blogs.map(blog => ({
          id: blog.id,
          title: blog.title,
          type: 'blog' as const,
          summary: blog.summary
        })));
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "There was an error performing the search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'course') {
      navigate(`/courses/${result.id}`);
    } else if (result.type === 'event') {
      navigate(`/events/${result.id}`);
    } else if (result.type === 'blog') {
      navigate(`/blogs/${result.id}`);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'blog': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Search className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/497e0a50-40be-4200-b5d8-b57acd658ca7.png"
          alt="Chukwuemeka Odumegwu Ojukwu University"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/70"></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-8 md:leading-tight leading-snug">
            Welcome to Chukwuemeka Odumegwu Ojukwu University
          </h1>
          <p className="text-white/90 text-base md:text-xl mb-8">
            Stay updated with the latest news, events, and resources for Uli and Igbariam campuses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-8 relative">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search for courses, events, news..."
                className="w-full px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              
              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 max-h-80 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg border-b last:border-b-0"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-start space-x-3">
                            {getResultIcon(result.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{result.title}</h4>
                              <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                              {result.summary && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.summary}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="flex flex-row flex-wrap gap-3">
            {customLinks.length > 0 ? (
              customLinks.map((link) => (
                <Button 
                  key={link.id}
                  variant="outline" 
                  className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {link.name}
                </Button>
              ))
            ) : (
              <>
                <Button variant="outline" className="bg-white/20 text-white border-white/40 hover:bg-white/30">
                  Academic Calendar
                </Button>
                <Button variant="outline" className="bg-white/20 text-white border-white/40 hover:bg-white/30">
                  Student Resources
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
