import React from 'react'

const Container = ({ children, narrow }) => {
  return (
    <div className={`container py-md-5 ${narrow ? 'container--narrow' : ''}`}>
      {children}
    </div>
  )
}

export default Container
