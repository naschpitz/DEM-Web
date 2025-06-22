import React from "react"
import { Toaster, ToastBar, toast } from "react-hot-toast"

/**
 * Custom Toaster component with close button functionality
 * Wraps react-hot-toast's Toaster with a custom render function
 * that adds a close button to all non-loading toasts
 */
const CustomToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 7500,
        style: {
          maxWidth: '500px',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: 'inherit',
                    opacity: 0.7,
                    padding: '0',
                    lineHeight: '1'
                  }}
                  title="Close"
                >
                  ×
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}

export default CustomToaster
