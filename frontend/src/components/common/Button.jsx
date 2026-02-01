function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  glow = false,
  rounded = false,
  ...props 
}) {
  const baseClasses = `
    font-semibold rounded-xl transition-all duration-200 ease-out
    flex items-center justify-center gap-2
    focus:outline-none focus:ring-4 focus:ring-offset-0
    transform active:scale-95
    disabled:transform-none
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-purple-600 
      hover:from-indigo-700 hover:to-purple-700 
      text-white shadow-lg shadow-indigo-500/30
      focus:ring-indigo-500/40
      disabled:from-indigo-400 disabled:to-purple-400
    `,
    secondary: `
      bg-gray-100 dark:bg-gray-700 
      hover:bg-gray-200 dark:hover:bg-gray-600 
      text-gray-900 dark:text-gray-100
      focus:ring-gray-500/40
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-rose-600 
      hover:from-red-700 hover:to-rose-700 
      text-white shadow-lg shadow-red-500/30
      focus:ring-red-500/40
      disabled:from-red-400 disabled:to-rose-400
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-green-600 
      hover:from-emerald-700 hover:to-green-700 
      text-white shadow-lg shadow-emerald-500/30
      focus:ring-emerald-500/40
      disabled:from-emerald-400 disabled:to-green-400
    `,
    warning: `
      bg-gradient-to-r from-amber-500 to-orange-500 
      hover:from-amber-600 hover:to-orange-600 
      text-white shadow-lg shadow-amber-500/30
      focus:ring-amber-500/40
    `,
    outline: `
      border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400
      hover:bg-indigo-50 dark:hover:bg-indigo-900/20
      focus:ring-indigo-500/40
    `,
    ghost: `
      text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-700/50
      focus:ring-gray-500/40
    `,
    glass: `
      bg-white/20 dark:bg-gray-800/30 backdrop-blur-lg
      border border-white/30 dark:border-gray-600/30
      text-white hover:bg-white/30 dark:hover:bg-gray-700/40
      focus:ring-white/40
    `,
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const glowClasses = glow ? 'animate-pulse-glow' : '';
  const roundedClasses = rounded ? '!rounded-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${glowClasses}
        ${roundedClasses}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </button>
  );
}

export default Button;
