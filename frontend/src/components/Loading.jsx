export default function Loading({ text = "Loading...", size = "md" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-3">
        <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
}

// Loading spinner variants
export function LoadingSpinner({ className = "" }) {
  return (
    <div className={`inline-block w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`}></div>
  );
}

export function LoadingPage({ text = "Loading page..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  );
}

export function LoadingButton({ children, loading = false, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      <div className="flex items-center justify-center space-x-2">
        {loading && <LoadingSpinner />}
        <span>{children}</span>
      </div>
    </button>
  );
}
