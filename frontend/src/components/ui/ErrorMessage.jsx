import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ 
  error, 
  onRetry, 
  className = "" 
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">Something went wrong</h4>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = "" 
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
};