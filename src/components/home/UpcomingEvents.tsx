
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Sample upcoming events data
const upcomingEvents = [
  {
    id: 1,
    title: 'Faculty of Science Week',
    date: 'May 15-19, 2023',
    location: 'Science Complex, COOU Campus',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b'
  },
  {
    id: 2,
    title: 'COOU Annual Symposium',
    date: 'May 25, 2023',
    location: 'University Auditorium',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678'
  },
  {
    id: 3,
    title: 'Entrepreneurship Workshop',
    date: 'June 5, 2023',
    location: 'Business School Building',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2'
  }
];

const UpcomingEvents = () => {
  const { user } = useAuth();
  
  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      toast({
        title: "Login Required",
        description: "Please log in to access event details and registration",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <Link 
            to={user ? "/events" : "/login"}
            className="text-blue-600 hover:underline flex items-center text-sm font-medium"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                
                <div className="flex items-start space-x-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{event.date}</span>
                </div>
                
                <div className="flex items-start space-x-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{event.location}</span>
                </div>
                
                <Link 
                  to={user ? `/events/${event.id}` : "/login"}
                  onClick={!user ? handleProtectedLink : undefined}
                >
                  <Button className="w-full">
                    {user ? "View Details" : "Login to Register"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
