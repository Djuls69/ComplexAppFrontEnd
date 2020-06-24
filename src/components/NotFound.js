import React from 'react'
import { Link } from 'react-router-dom'
import Page from './Page'

const NotFound = () => {
  return (
    <Page title='404' narrow>
      <div className='text-center'>
        <h2>Whoops, page introuvable....</h2>
        <p className='lead text-muted'>
          Rendez-vous sur la <Link to='/'>page d'accueil</Link> pour
          recommencer.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
