
import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBlogs from '@/components/home/FeaturedBlogs';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ResourcesSection from '@/components/home/ResourcesSection';
import PublicTimetable from '@/components/home/PublicTimetable';
import QuickNotification from '@/components/home/QuickNotification';
import FacultySection from '@/components/home/FacultySection';
import LiveClock from '@/components/home/LiveClock';

const Index = () => {
  useSEO({
    title: "COOU Updates - Chukwuemeka Odumegwu Ojukwu University Portal",
    description: "Official updates portal for Chukwuemeka Odumegwu Ojukwu University. Access academic schedules, events, news, and campus resources.",
    keywords: "COOU, Chukwuemeka Odumegwu Ojukwu University, student portal, academic updates, university events, course schedules, exam updates",
    ogTitle: "COOU Updates - University Portal",
    ogDescription: "Stay updated with the latest academic information from Chukwuemeka Odumegwu Ojukwu University",
    canonicalUrl: window.location.origin
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <QuickNotification />
          </div>
          <div className="md:col-span-1">
            <LiveClock />
          </div>
        </div>
      </div>
      <PublicTimetable />
      <FeaturedBlogs />
      <FeaturedCourses />
      <UpcomingEvents />
      <FacultySection />
      <ResourcesSection />
      <Footer />
    </div>
  );
};

export default Index;
