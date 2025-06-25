import toast from "react-hot-toast"

/**
 * Alert utility that provides the same API as react-s-alert-v3
 * but uses react-hot-toast under the hood for better performance and modern React support
 */
class Alert {
  /**
   * Show a success toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static success(message, options = {}) {
    const duration = options.timeout === "none" ? Infinity : options.timeout || 7500

    return toast.success(message, {
      duration,
      position: "bottom-right",
      style: {
        background: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
      },
      iconTheme: {
        primary: "#28a745",
        secondary: "#fff",
      },
      ...options,
    })
  }

  /**
   * Show an error toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static error(message, options = {}) {
    const duration = options.timeout === "none" ? Infinity : options.timeout || 7500

    return toast.error(message, {
      duration,
      position: "bottom-right",
      style: {
        background: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
      },
      iconTheme: {
        primary: "#dc3545",
        secondary: "#fff",
      },
      ...options,
    })
  }

  /**
   * Show a warning toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static warning(message, options = {}) {
    const duration = options.timeout === "none" ? Infinity : options.timeout || 7500

    return toast(message, {
      duration,
      position: "bottom-right",
      icon: "⚠️",
      style: {
        background: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffeaa7",
      },
      ...options,
    })
  }

  /**
   * Show an info toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static info(message, options = {}) {
    const duration = options.timeout === "none" ? Infinity : options.timeout || 7500

    return toast(message, {
      duration,
      position: "bottom-right",
      icon: "ℹ️",
      style: {
        background: "#d1ecf1",
        color: "#0c5460",
        border: "1px solid #bee5eb",
      },
      ...options,
    })
  }

  /**
   * Close all active toast notifications
   */
  static closeAll() {
    toast.dismiss()
  }

  /**
   * Close a specific toast notification
   * @param {string} toastId - The ID of the toast to close
   */
  static close(toastId) {
    toast.dismiss(toastId)
  }

  /**
   * Show a custom toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static custom(message, options = {}) {
    const duration = options.timeout === "none" ? Infinity : options.timeout || 7500

    return toast(message, {
      duration,
      position: "bottom-right",
      ...options,
    })
  }

  /**
   * Show a loading toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional configuration
   */
  static loading(message, options = {}) {
    return toast.loading(message, {
      position: "bottom-right",
      ...options,
    })
  }

  /**
   * Promise-based toast that shows loading, then success/error
   * @param {Promise} promise - The promise to track
   * @param {object} messages - Success and error messages
   * @param {object} options - Optional configuration
   */
  static promise(promise, messages, options = {}) {
    return toast.promise(promise, messages, {
      position: "bottom-right",
      ...options,
    })
  }
}

export default Alert
