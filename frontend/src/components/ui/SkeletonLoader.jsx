export const SkeletonLoader = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-xl"></div>
    </div>
  );
};

export const ClassCardSkeleton = () => {
  return (
    <div className="p-4 bg-white/50 rounded-xl shadow-md animate-pulse">
      <div className="flex flex-col space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export const WebinarCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl animate-pulse">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-[70%] p-4 rounded-2xl bg-gray-200">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};