
import React from 'react';
import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

export const Shimmer = ({
  className,
  width = "100%",
  height = "1rem",
  rounded = false,
  circle = false,
  ...props
}: ShimmerProps) => {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]",
        rounded && "rounded",
        circle && "rounded-full",
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
      {...props}
    />
  );
};

export const ShimmerText = ({ lines = 3, lastLineWidth = 70 }: { lines?: number, lastLineWidth?: number }) => {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer 
          key={i} 
          height="0.875rem" 
          rounded 
          className={i === lines - 1 ? `w-${lastLineWidth}%` : "w-full"}
        />
      ))}
    </div>
  );
};

export const ShimmerCard = () => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Shimmer height="1.5rem" width="60%" rounded />
      <ShimmerText lines={2} />
      <div className="flex items-center space-x-2 pt-2">
        <Shimmer height="1rem" width="4rem" rounded />
        <Shimmer height="1rem" width="5rem" rounded />
      </div>
    </div>
  );
};

export const ShimmerAvatar = ({ size = 40 }: { size?: number }) => {
  return <Shimmer width={size} height={size} circle />;
};

export const ShimmerButton = ({ width = 100 }: { width?: number }) => {
  return <Shimmer width={width} height={36} rounded />;
};

export const ShimmerImage = ({ height = 200 }: { height?: number }) => {
  return <Shimmer width="100%" height={height} rounded />;
};

export const ShimmerTable = ({ rows = 5, columns = 3 }: { rows?: number, columns?: number }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Shimmer key={i} height="1rem" width={`${100 / columns}%`} rounded />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Shimmer 
                  key={colIndex} 
                  height="1rem" 
                  width={`${100 / columns - 5}%`}
                  rounded 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shimmer;
