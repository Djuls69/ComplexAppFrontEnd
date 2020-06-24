import React, { useEffect } from 'react'
import Container from './Container'

const Page = ({ title, children, narrow }) => {
  useEffect(() => {
    document.title = `${title} | ComplexApp`
    window.scrollTo(0, 0)
  }, [title])

  return <Container narrow={narrow}>{children}</Container>
}

export default Page
