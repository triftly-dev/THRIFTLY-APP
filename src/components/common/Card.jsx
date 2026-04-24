const Card = ({ children, className = '', padding = true, hover = false }) => {
  const baseStyles = 'bg-white rounded-2xl shadow-soft border border-gray-100'
  const paddingClass = padding ? 'p-6 md:p-8' : ''
  const hoverClass = hover ? 'hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''
  
  return (
    <div className={`${baseStyles} ${paddingClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}

export default Card
