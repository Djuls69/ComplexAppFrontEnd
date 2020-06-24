import React, { useContext } from 'react'
import { Link, withRouter } from 'react-router-dom'
import DispatchContext from '../DispatchContext'
import StateContext from '../StateContext'
import ReactTooltip from 'react-tooltip'

const HeaderLoggedIn = props => {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const handleLogout = () => {
    appDispatch({ type: 'logout' })
    appDispatch({ type: 'closeChat' })
    appDispatch({ type: 'flashMessage', value: 'Vous vous êtes bien déconnecté.' })
    props.history.push('/')
  }

  const handleSearchIcon = e => {
    e.preventDefault()
    appDispatch({ type: 'openSearch' })
  }

  return (
    <div className='flex-row my-3 my-md-0'>
      <a
        href='#!'
        onClick={handleSearchIcon}
        className='text-white mr-2 header-search-icon'
        data-tip='Chercher'
        data-for='search'
      >
        <i className='fas fa-search'></i>
      </a>{' '}
      <ReactTooltip place='bottom' id='search' className='custom-tooltip' />
      <span
        onClick={() => appDispatch({ type: 'toggleChat' })}
        className={`mr-2 header-chat-icon ${!appState.unreadChatCount ? 'text-white' : 'text-danger'}`}
        data-tip='Chat'
        data-for='chat'
      >
        <i className='fas fa-comment'></i>
        {appState.unreadChatCount ? (
          <span className='chat-count-badge text-white'>
            {appState.unreadChatCount < 10 ? appState.unreadChatCount : '9+'}
          </span>
        ) : (
          ''
        )}
        <span className='chat-count-badge text-white'> </span>
      </span>{' '}
      <ReactTooltip place='bottom' id='chat' className='custom-tooltip' />
      <Link to={`/profile/${appState.user.username}`} className='mr-2' data-tip='Mon Profil' data-for='profile'>
        <img className='small-header-avatar' src={appState.user.avatar} alt='avatar' />
      </Link>{' '}
      <ReactTooltip place='bottom' id='profile' className='custom-tooltip' />
      <Link to='/create-post' className='btn btn-sm btn-success mr-2'>
        Créer un Post
      </Link>{' '}
      <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
        Se Déconnecter
      </button>
    </div>
  )
}

export default withRouter(HeaderLoggedIn)
