const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full'
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    bu: 'bg-accent-500 text-white shadow-sm',
    discount: 'bg-primary-600 text-white shadow-sm',
    sold: 'bg-gray-800 text-white shadow-sm',
    new: 'bg-green-600 text-white shadow-sm'
  }
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
