import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import CampusSelector from './faculty/CampusSelector';
import FacultyTabs from './faculty/FacultyTabs';
import FacultyContent from './faculty/FacultyContent';

interface Department {
  id: string;
  name: string;
  campus?: string;
}

interface Faculty {
  id: string;
  name: string;
  campus?: string;
  departments: Department[];
}

interface CampusData {
  [key: string]: Faculty[];
}

const FacultySection = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [campusData, setCampusData] = useState<CampusData>({
    'Uli': [],
    'Igbariam': []
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeCampus, setActiveCampus] = useState<string>('Uli');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setIsLoading(true);
        const {
          data: facultiesData,
          error: facultiesError
        } = await supabase
          .from('faculties')
          .select('*')
          .order('name');
        
        if (facultiesError) throw facultiesError;
        
        const {
          data: departmentsData,
          error: departmentsError
        } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (departmentsError) throw departmentsError;

        if (!facultiesData || facultiesData.length === 0) {
          console.log('No faculties data found');
          setFaculties([]);
          setCampusData({'Uli': [], 'Igbariam': []});
          setActiveTab(null);
          setIsLoading(false);
          return;
        }

        const facultiesWithDepartments = facultiesData.map((faculty: any) => {
          const facultyDepts = departmentsData.filter((dept: any) => dept.faculty_id === faculty.id);
          return {
            ...faculty,
            departments: facultyDepts.map((dept: any) => ({
              ...dept,
              campus: dept.campus || faculty.campus || 'Uli' 
            }))
          };
        });
        
        setFaculties(facultiesWithDepartments);

        const campusGroups: CampusData = {
          'Uli': [],
          'Igbariam': []
        };
        
        facultiesWithDepartments.forEach((faculty: Faculty) => {
          const facultyCampus = faculty.campus || 'Uli';
          if (campusGroups[facultyCampus]) {
            campusGroups[facultyCampus].push(faculty);
          } else {
            campusGroups[facultyCampus] = [faculty];
          }
        });
        
        if (!campusGroups['Uli']) campusGroups['Uli'] = [];
        if (!campusGroups['Igbariam']) campusGroups['Igbariam'] = [];

        setCampusData(campusGroups);

        const currentCampusFaculties = campusGroups[activeCampus] || [];
        if (currentCampusFaculties.length > 0) {
          const isValidActiveTab = currentCampusFaculties.some(f => f.id === activeTab);
          if (!isValidActiveTab || !activeTab) {
            setActiveTab(currentCampusFaculties[0].id);
          }
        } else {
          setActiveTab(null);
        }

      } catch (error) {
        console.error('Error fetching faculties:', error);
        setFaculties([]);
        setCampusData({'Uli': [], 'Igbariam': []});
        setActiveTab(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFaculties();
  }, [activeCampus]);

  const handleCampusChange = (campus: string) => {
    setActiveCampus(campus);
  };

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Our Faculties and Departments</h2>
          <p className="text-base md:text-lg text-gray-600">
            Explore the academic departments at Chukwuemeka Odumegwu Ojukwu University
          </p>
          
          <CampusSelector 
            activeCampus={activeCampus} 
            onCampusChange={handleCampusChange}
          />
        </div>

        {(!campusData[activeCampus] || campusData[activeCampus].length === 0) ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No faculties found for {activeCampus} Campus.</p>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <Tabs value={activeTab || undefined} onValueChange={setActiveTab} className="w-full">
              <FacultyTabs 
                faculties={campusData[activeCampus] || []}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              <FacultyContent 
                faculties={campusData[activeCampus] || []}
                activeCampus={activeCampus}
              />
            </Tabs>
          </div>
        )}
      </div>
    </section>
  );
};

export default FacultySection;
