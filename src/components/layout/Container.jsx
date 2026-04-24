const Container = ({ children, className = '' }) => {
  return (
    <div className={`container mx-auto px-4 py-6 md:py-8 ${className}`}>
      {children}
    </div>
  )
}

export default Container
