
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, User, Facebook, Twitter, Linkedin, Copy, Check, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

const BlogDetail = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', blogId)
          .single();
          
        if (error) throw error;
        
        setBlog(data);
        
        // Fetch related posts based on similar category
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('id, title, created_at, image_url, summary')
          .neq('id', blogId)
          .limit(3);
          
        setRelatedPosts(relatedData || []);
        
      } catch (error) {
        console.error('Error fetching blog details:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (blogId) {
      fetchBlog();
      // Scroll to top when navigating to a blog post
      window.scrollTo(0, 0);
    }
  }, [blogId, toast]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Generate a table of contents from the blog content
  const generateTableOfContents = () => {
    if (!blog || !blog.content) return [];
    
    const sections = blog.content.split('\n\n').filter(section => 
      section.startsWith('## ') || section.startsWith('### ')
    );
    
    return sections.map((section, index) => ({
      id: `section-${index}`,
      title: section.replace(/^##\s+|^###\s+/, '').trim(),
      level: section.startsWith('## ') ? 2 : 3
    }));
  };
  
  const tableOfContents = blog ? generateTableOfContents() : [];
  
  // Estimate reading time
  const calculateReadingTime = (content) => {
    if (!content) return '0 min read';
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    return `${readingTime} min read`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-60 w-full mb-8 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : blog && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Link 
                to="/blogs" 
                className="inline-flex items-center text-blue-700 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to all posts</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar with table of contents */}
              <div className="order-2 lg:order-1 lg:col-span-1">
                <div className="sticky top-8">
                  {tableOfContents.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-700" />
                        Table of Contents
                      </h3>
                      <nav className="space-y-2">
                        {tableOfContents.map((section) => (
                          <a 
                            key={section.id}
                            href={`#${section.id}`}
                            className={`block text-gray-600 hover:text-blue-700 transition-colors ${
                              section.level === 3 ? 'pl-4 text-sm' : 'font-medium'
                            }`}
                          >
                            {section.title}
                          </a>
                        ))}
                      </nav>
                    </div>
                  )}
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Share This Post</h3>
                    <div className="flex space-x-2 mb-4">
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a 
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-800 text-white p-2 rounded-full hover:bg-blue-900"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <button 
                        onClick={copyToClipboard}
                        className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="order-1 lg:order-2 lg:col-span-3">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {blog.image_url && (
                    <img 
                      src={blog.image_url} 
                      alt={blog.title} 
                      className="w-full h-80 object-cover rounded-t-lg" 
                    />
                  )}
                  
                  <div className="p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
                    
                    <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-blue-700" />
                        </div>
                        <span>{blog.author || 'COOU Admin'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>{calculateReadingTime(blog.content)}</span>
                      </div>
                    </div>
                    
                    {blog.summary && (
                      <div className="bg-blue-50 border-l-4 border-blue-700 p-4 mb-6">
                        <p className="italic text-gray-700">{blog.summary}</p>
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(blog.content, {
                          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                          ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id']
                        }) 
                      }}
                    />
                  </div>
                </article>
                
                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPosts.map((post) => (
                        <Link 
                          key={post.id}
                          to={`/blogs/${post.id}`}
                          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={post.image_url || 'https://via.placeholder.com/300x200?text=COOU+Blog'} 
                              alt={post.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{formatDate(post.created_at)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
