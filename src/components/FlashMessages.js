import React from 'react'

const FlashMessages = ({ messages }) => {
  return (
    <div className='floating-alerts'>
      {messages.map((msg, idx) => {
        return (
          <div
            key={idx}
            className='alert alert-success text-center floating-alert shadow-sm'
          >
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
