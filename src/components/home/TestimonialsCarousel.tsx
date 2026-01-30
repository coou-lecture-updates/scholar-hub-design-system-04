import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  department: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Chidera Okonkwo",
    role: "400 Level Student",
    department: "Computer Science",
    content: "CoouConnect has transformed how I stay updated with campus activities. The timetable feature saves me hours every week!",
  },
  {
    id: 2,
    name: "Adaeze Nwachukwu",
    role: "300 Level Student",
    department: "Accounting",
    content: "Finding events and connecting with course mates has never been easier. This platform is a game-changer for COOU students.",
  },
  {
    id: 3,
    name: "Emeka Obi",
    role: "500 Level Student",
    department: "Medicine",
    content: "The exam updates and lecture notifications keep me on track. I never miss important announcements anymore.",
  },
  {
    id: 4,
    name: "Blessing Eze",
    role: "200 Level Student",
    department: "Mass Communication",
    content: "Love the community forum! It's like having the entire school in your pocket. Great for networking and getting help.",
  },
];

const TestimonialsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">What Students Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from fellow COOU students about their experience with CoouConnect
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-card border-border/50 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <div className="min-h-[150px] flex items-center justify-center">
                <p className="text-lg md:text-xl text-foreground leading-relaxed text-center italic">
                  "{testimonials[currentIndex].content}"
                </p>
              </div>

              <div className="flex flex-col items-center mt-8">
                <Avatar className="h-16 w-16 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {getInitials(testimonials[currentIndex].name)}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-foreground">{testimonials[currentIndex].name}</h4>
                <p className="text-sm text-muted-foreground">
                  {testimonials[currentIndex].role} • {testimonials[currentIndex].department}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 rounded-full shadow-md"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 rounded-full shadow-md"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
