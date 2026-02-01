function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md', 
  text = '',
  variant = 'primary' 
}) {
  const sizeConfig = {
    sm: { spinner: 'w-6 h-6', border: 'border-2', text: 'text-sm' },
    md: { spinner: 'w-10 h-10', border: 'border-3', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', border: 'border-4', text: 'text-lg' },
    xl: { spinner: 'w-24 h-24', border: 'border-4', text: 'text-xl' }
  };

  const variantColors = {
    primary: 'border-indigo-200 border-t-indigo-600',
    success: 'border-emerald-200 border-t-emerald-600',
    warning: 'border-amber-200 border-t-amber-600',
    danger: 'border-red-200 border-t-red-600',
    white: 'border-white/30 border-t-white',
  };

  const config = sizeConfig[size];

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      {/* Animated Spinner */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`
          absolute inset-0 ${config.spinner} rounded-full
          bg-gradient-to-r from-indigo-500 to-purple-500 
          opacity-20 animate-ping
        `} />
        
        {/* Main spinner */}
        <div className={`
          ${config.spinner} ${config.border}
          rounded-full animate-spin
          ${variantColors[variant]}
        `} />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-2 h-2 rounded-full 
            bg-gradient-to-r from-indigo-600 to-purple-600
            animate-pulse
          `} />
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <p className={`
          ${config.text} font-medium 
          text-gray-600 dark:text-gray-300
          animate-pulse
        `}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-mesh z-50">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
