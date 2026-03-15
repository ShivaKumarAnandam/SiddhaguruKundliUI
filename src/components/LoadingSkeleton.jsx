import './LoadingSkeleton.css'

const LoadingSkeleton = ({ lines = 5, title = "✨ AI is calculating..." }) => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-title">{title}</div>
      <div className="skeleton-content">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="skeleton-line" style={{ width: `${100 - (i * 5)}%` }}></div>
        ))}
      </div>
      <div className="skeleton-pulse">
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
