
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  Calendar, 
  User, 
  Clock,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostProps {
  title: string;
  content: string;
  author?: string;
  date?: string;
  image_url?: string;
  isLoading?: boolean;
  readTime?: number;
  category?: string;
}

const BlogPost: React.FC<BlogPostProps> = ({
  title,
  content,
  author,
  date,
  image_url,
  isLoading = false,
  readTime = 5,
  category = 'Campus Life'
}) => {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(true);
  
  useEffect(() => {
    if (!content || isLoading) return;
    
    // Parse content to find headings and create table of contents
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headings = tempDiv.querySelectorAll('h2, h3, h4');
    const toc: TableOfContentsItem[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      heading.id = id;
      toc.push({ id, text, level });
    });
    
    setTableOfContents(toc);
  }, [content, isLoading]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    });
  };

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Process content to add classes to images
  const processContent = (content: string) => {
    if (!content) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Add classes to images for rounded corners and responsive behavior
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      img.classList.add('rounded-lg', 'w-full', 'h-auto', 'my-6', 'shadow-sm');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('alt', img.alt || title);
    });
    
    // Add classes to paragraphs for better readability
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.classList.add('my-4', 'leading-relaxed', 'text-gray-700');
    });
    
    // Add classes to headings
    const headings = tempDiv.querySelectorAll('h2, h3, h4');
    headings.forEach((heading, index) => {
      heading.classList.add('font-bold', 'mb-3', 'mt-6', 'scroll-mt-24');
      
      if (heading.tagName === 'H2') {
        heading.classList.add('text-2xl', 'text-gray-900', 'border-b', 'border-gray-100', 'pb-2');
      } else if (heading.tagName === 'H3') {
        heading.classList.add('text-xl', 'text-gray-800');
      } else if (heading.tagName === 'H4') {
        heading.classList.add('text-lg', 'text-gray-800');
      }
      
      heading.id = `heading-${index}`;
    });
    
    // Apply classes to lists
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.classList.add('my-4', 'ml-6');
      
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        item.classList.add('my-1', 'text-gray-700');
      });
      
      if (list.tagName === 'UL') {
        list.classList.add('list-disc');
      } else {
        list.classList.add('list-decimal');
      }
    });
    
    return tempDiv.innerHTML;
  };

  const actualReadTime = content ? calculateReadingTime(content) : readTime;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full mb-8 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* SEO Meta tags would go in the head section of the document */}
      
      {/* Back to blogs */}
      <div className="mb-6">
        <Link 
          to="/blogs" 
          className="inline-flex items-center text-blue-700 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all blogs
        </Link>
      </div>
      
      {/* Blog Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        
        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-4">
          {category && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              {category}
            </span>
          )}
          {author && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{author}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{actualReadTime} min read</span>
          </div>
        </div>
        
        {/* Share buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-sm text-gray-600 flex items-center">
            <Share2 className="h-4 w-4 mr-1" /> Share:
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`, '_blank')}
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Share on Twitter</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
          >
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Share on Facebook</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`, '_blank')}
          >
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">Share on LinkedIn</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy link</span>
          </Button>
        </div>
      </header>
      
      {/* Featured Image */}
      {image_url && (
        <div className="mb-8">
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-auto object-cover rounded-xl shadow-md"
            style={{ maxHeight: '500px' }}
          />
        </div>
      )}
      
      <div className="lg:flex lg:gap-8">
        {/* Table of Contents - Visible on desktop */}
        {tableOfContents.length > 0 && (
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-24 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h2 className="font-semibold text-lg mb-2 flex justify-between items-center">
                Table of Contents
                <button 
                  onClick={() => setIsTocOpen(!isTocOpen)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isTocOpen ? '−' : '+'}
                </button>
              </h2>
              
              {isTocOpen && (
                <nav className="toc-nav">
                  <ul className="space-y-2 text-sm">
                    {tableOfContents.map((item) => (
                      <li 
                        key={item.id} 
                        className="hover:text-blue-700"
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                      >
                        <a 
                          href={`#${item.id}`} 
                          className="block py-1 border-l-2 border-transparent hover:border-blue-500 pl-2 transition-colors"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </aside>
        )}
        
        {/* Blog Content */}
        <div className="lg:flex-grow blog-content prose prose-lg max-w-none">
          {/* Table of Contents - Mobile accordion */}
          {tableOfContents.length > 0 && (
            <div className="lg:hidden mb-6 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setIsTocOpen(!isTocOpen)} 
                className="w-full flex justify-between items-center p-4 font-medium text-gray-900 hover:bg-gray-100"
              >
                <span>Table of Contents</span>
                <span>{isTocOpen ? '−' : '+'}</span>
              </button>
              
              {isTocOpen && (
                <nav className="px-4 pb-4">
                  <ul className="space-y-2 text-sm">
                    {tableOfContents.map((item) => (
                      <li 
                        key={item.id} 
                        className="hover:text-blue-700"
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                      >
                        <a 
                          href={`#${item.id}`} 
                          className="block py-1 border-l-2 border-transparent hover:border-blue-500 pl-2"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}
          
          {/* Main content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: processContent(content) }}
          />
          
          {/* Article footer */}
          <div className="mt-12 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium">Share this article</h3>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0" 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`, '_blank')}
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0" 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Share on Facebook</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0" 
                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`, '_blank')}
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy link</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <Link 
                  to="/blogs" 
                  className="text-blue-700 hover:text-blue-900 font-medium flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to all blogs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
