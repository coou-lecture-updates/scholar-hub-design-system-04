
import React from 'react';

interface CampusSelectorProps {
  activeCampus: string;
  onCampusChange: (campus: string) => void;
}

const CampusSelector = ({ activeCampus, onCampusChange }: CampusSelectorProps) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="inline-flex rounded-md shadow-sm">
        <button 
          className={`px-4 py-2 text-sm md:text-base font-medium rounded-l-lg border border-gray-300 ${
            activeCampus === 'Uli' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`} 
          onClick={() => onCampusChange('Uli')}
        >
          Uli Campus
        </button>
        <button 
          className={`px-4 py-2 text-sm md:text-base font-medium rounded-r-lg border border-gray-300 border-l-0 ${
            activeCampus === 'Igbariam' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`} 
          onClick={() => onCampusChange('Igbariam')}
        >
          Igbariam Campus
        </button>
      </div>
    </div>
  );
};

export default CampusSelector;
