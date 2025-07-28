import React from 'react';

interface ProgressDotsProps {
  progress: number; // 0-100
  totalDots?: number;
}

function ProgressDots({ progress, totalDots = 5 }: ProgressDotsProps) {
  const filledDots = Math.round((progress / 100) * totalDots);
  
  const getProgressColor = () => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEmptyColor = () => {
    if (progress >= 80) return 'bg-green-100';
    if (progress >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        {Array.from({ length: totalDots }, (_, index) => {
          const isFilled = index < filledDots;
          return (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isFilled ? getProgressColor() : getEmptyColor()
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-gray-600 ml-2">
        {progress}%
      </span>
    </div>
  );
}

export default ProgressDots;