const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const isCurrentlyLoading = loading || isLoading;
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 shadow-sm hover:shadow-soft',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:border-primary-300 disabled:text-primary-300',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-300 shadow-sm hover:shadow-soft',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-200',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',
    ghost: 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isCurrentlyLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {isCurrentlyLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  )
}

export default Button
