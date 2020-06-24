import React, { useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useImmerReducer } from 'use-immer'
import { CSSTransition } from 'react-transition-group'
import axios from 'axios'

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

// Components
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import CreatePost from './components/CreatePost'
import ViewSinglePost from './components/ViewSinglePost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import Search from './components/Search'
import Chat from './components/Chat.js'
import NotFound from './components/NotFound'

axios.defaults.baseURL = process.env.BACKENDURL || 'https://mycomplexapp-backend.herokuapp.com'

const App = () => {
  const initState = {
    loggedIn: Boolean(localStorage.getItem('complexAppToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexAppToken'),
      username: localStorage.getItem('complexAppUsername'),
      avatar: localStorage.getItem('complexAppAvatar')
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        break
      case 'logout':
        draft.loggedIn = false
        break
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        break
      case 'openSearch':
        draft.isSearchOpen = true
        break
      case 'closeSearch':
        draft.isSearchOpen = false
        break
      case 'closeChat':
        draft.isChatOpen = false
        break
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        break
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        break
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        break
      default:
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexAppToken', state.user.token)
      localStorage.setItem('complexAppUsername', state.user.username)
      localStorage.setItem('complexAppAvatar', state.user.avatar)
    } else {
      localStorage.removeItem('complexAppToken')
      localStorage.removeItem('complexAppUsername')
      localStorage.removeItem('complexAppAvatar')
    }
  }, [state.loggedIn, state.user.avatar, state.user.token, state.user.username])

  // Check if our token has expired or not
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = axios.CancelToken.source()
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          )
          if (!response.data) {
            dispatch({ type: 'logout' })
            dispatch({ type: 'flashMessage', value: 'Session expirée, merci de vous reconnecter.' })
          }
        } catch (err) {
          console.error('Server error, or the request was cancelled', err)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Router>
          <Header />
          <FlashMessages messages={state.flashMessages} />
          <Switch>
            <Route path='/about' component={About} />
            <Route path='/terms' component={Terms} />
            <Route path='/create-post' component={CreatePost} />
            <Route exact path='/post/:id' component={ViewSinglePost} />
            <Route path='/post/:id/edit' component={EditPost} />
            <Route path='/profile/:username' component={Profile} />
            <Route path='/' exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route component={NotFound} />
          </Switch>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames='search-overlay' unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </Router>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export default App
