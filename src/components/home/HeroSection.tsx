import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Calendar, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CustomLink {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: "course" | "event" | "blog";
  summary?: string;
}

const HeroSection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchCustomLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_links")
          .select("*")
          .eq("is_active", true)
          .eq("category", "hero")
          .order("name");

        if (error) {
          console.error("Error fetching custom links:", error);
          return;
        }

        if (data) {
          setCustomLinks(data);
        }
      } catch (err) {
        console.error("Failed to fetch custom links:", err);
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

      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, description")
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(3);

      if (courses) {
        results.push(
          ...courses.map((course) => ({
            id: course.id,
            title: course.title,
            type: "course" as const,
            summary: course.description,
          })),
        );
      }

      const { data: events } = await supabase
        .from("events")
        .select("id, title, description")
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(3);

      if (events) {
        results.push(
          ...events.map((event) => ({
            id: event.id,
            title: event.title,
            type: "event" as const,
            summary: event.description,
          })),
        );
      }

      const { data: blogs } = await supabase
        .from("blog_posts")
        .select("id, title, summary")
        .eq("published", true)
        .or(`title.ilike.%${query}%, summary.ilike.%${query}%`)
        .limit(3);

      if (blogs) {
        results.push(
          ...blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            type: "blog" as const,
            summary: blog.summary,
          })),
        );
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
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
    if (result.type === "course") {
      navigate(`/courses/${result.id}`);
    } else if (result.type === "event") {
      navigate(`/events/${result.id}`);
    } else if (result.type === "blog") {
      navigate(`/blogs/${result.id}`);
    }

    setShowResults(false);
    setSearchQuery("");
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "blog":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/497e0a50-40be-4200-b5d8-b57acd658ca7.png"
          alt="Chukwuemeka Odumegwu Ojukwu University Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/75 via-blue-900/70 to-blue-900/80" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 pt-16 pb-20 md:py-28 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title with elegant italic styling like reference */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight italic">
            Welcome to Chukwuemeka Odumegwu Ojukwu University
          </h1>
          
          <p className="text-white/90 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto">
            Stay updated with the latest news, events, and resources for Uli and Igbariam campuses
          </p>

          {/* Enhanced Search Card - matching reference image */}
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl px-5 py-5 md:px-8 md:py-6 mb-8 md:mb-10">
            <div className="relative w-full mb-4">
              <input
                type="text"
                placeholder="Search for courses, events, news..."
                className="w-full px-5 py-4 pr-12 rounded-full text-base md:text-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50/50 text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 bg-background rounded-xl shadow-xl mt-2 max-h-80 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="p-3 hover:bg-muted cursor-pointer rounded-lg border-b last:border-b-0"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-start space-x-3">
                            {getResultIcon(result.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">{result.title}</h4>
                              <p className="text-[11px] text-muted-foreground capitalize">{result.type}</p>
                              {result.summary && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{result.summary}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-base font-semibold shadow-md"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Quick links - centered below search card */}
          <div className="flex flex-wrap justify-center gap-4">
            {customLinks.length > 0 ? (
              customLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="bg-white/15 text-white border-white/50 hover:bg-white/25 hover:border-white/70 rounded-full px-6 py-2.5 font-medium backdrop-blur-sm transition-all"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  {link.name}
                </Button>
              ))
            ) : (
              <>
                <Button
                  variant="outline"
                  className="bg-white/15 text-white border-white/50 hover:bg-white/25 hover:border-white/70 rounded-full px-6 py-2.5 font-medium backdrop-blur-sm transition-all"
                >
                  Academic Calendar
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/15 text-white border-white/50 hover:bg-white/25 hover:border-white/70 rounded-full px-6 py-2.5 font-medium backdrop-blur-sm transition-all"
                >
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
