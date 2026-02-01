function Card({ 
  children, 
  className = '', 
  hover = false, 
  glass = false,
  gradient = null,
  noPadding = false,
  animate = false,
  onClick,
  ...props 
}) {
  const baseClasses = `
    rounded-2xl 
    transition-all duration-300 ease-out
    ${noPadding ? '' : 'p-5'}
  `;
  
  const glassClasses = glass 
    ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30' 
    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50';
  
  const shadowClasses = 'shadow-soft hover:shadow-card-hover';
  
  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer' 
    : 'hover:-translate-y-0.5';
  
  const animateClasses = animate ? 'animate-fade-in' : '';
  
  const gradientClasses = gradient ? `bg-gradient-to-br ${gradient}` : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${gradientClasses || glassClasses}
        ${shadowClasses}
        ${hoverClasses}
        ${animateClasses}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
