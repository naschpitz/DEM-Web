import React from "react"
import PropTypes from "prop-types"

import "./spinner.css"

/**
 * Reusable Bootstrap spinner component
 * @param {string} message - The loading message to display
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showMessage - Whether to show the message below the spinner (default: true)
 * @param {string} className - Additional CSS classes for the container
 */
const Spinner = ({ message = "Loading...", size = "md", showMessage = true, className = "" }) => {
  // Define size mappings
  const sizeMap = {
    sm: { width: "1.5rem", height: "1.5rem" },
    md: { width: "3rem", height: "3rem" },
    lg: { width: "4rem", height: "4rem" },
  }

  const spinnerStyle = sizeMap[size] || sizeMap.md

  return (
    <div className={`text-center p-4 ${className}`}>
      <div className="spinner-border" role="status" style={spinnerStyle}>
        <span className="sr-only">{message}</span>
      </div>
      {showMessage && <div className="mt-2">{message}</div>}
    </div>
  )
}

Spinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showMessage: PropTypes.bool,
  className: PropTypes.string,
}

export default Spinner
