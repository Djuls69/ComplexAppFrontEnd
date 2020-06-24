/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import { CSSTransition } from 'react-transition-group'
import axios from 'axios'
import DispatchContext from '../DispatchContext'
import Page from './Page'

const HomeGuest = () => {
  const appDispatch = useContext(DispatchContext)

  const initState = {
    username: {
      value: '',
      hasErrors: false,
      ErrorMessage: '',
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: '',
      hasErrors: false,
      ErrorMessage: '',
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: '',
      hasErrors: false,
      errorMessage: ''
    },
    submitCount: 0
  }

  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'usernameImmediately':
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.errorMessage = 'Pas plus de 30 charactères.'
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.errorMessage = 'Pas de charactères spéciaux.'
        }
        break
      case 'usernameAfterDelay':
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.errorMessage = 'Au moins 3 charactères.'
        }
        if (!draft.username.hasErrors) {
          draft.username.checkCount++
        }
        break
      case 'usernameUniqueResults':
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.errorMessage = 'Ce pseudo est déjà utilisé.'
        } else {
          draft.username.isUnique = true
        }
        break
      case 'emailImmediately':
        draft.email.hasErrors = false
        draft.email.value = action.value
        break
      case 'emailAfterDelay':
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.errorMessage = 'Veuillez entrer une adresse email valide.'
        }
        if (!draft.email.hasErrors) {
          draft.email.checkCount++
        }
        break
      case 'emailUniqueResults':
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.errorMessage = 'Cet email est déjà utilisé.'
        } else {
          draft.email.isUnique = true
        }
        break
      case 'passwordImmediately':
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.errorMessage = 'Pas plus de 50 charactères.'
        }
        break
      case 'passwordAfterDelay':
        if (draft.password.value.length < 6) {
          draft.password.hasErrors = true
          draft.password.errorMessage = '6 charactères minimum.'
        }
        break
      case 'submitForm':
        if (
          !draft.username.hasErrors &&
          draft.username.isUnique &&
          !draft.email.hasErrors &&
          draft.email.isUnique &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++
        }
        break
      default:
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: 'usernameAfterDelay' }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.username.checkCount) {
      const myRequest = axios.CancelToken.source()
      const fetchData = async () => {
        try {
          const response = await axios.post(
            '/doesUsernameExist',
            { username: state.username.value },
            { cancelToken: myRequest.token }
          )
          dispatch({ type: 'usernameUniqueResults', value: response.data })
        } catch (err) {
          console.error('Server Error', err)
        }
      }
      fetchData()
      return () => myRequest.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: 'emailAfterDelay' }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.email.checkCount) {
      const myRequest = axios.CancelToken.source()
      const fetchData = async () => {
        try {
          const response = await axios.post(
            '/doesEmailExist',
            { email: state.email.value },
            { cancelToken: myRequest.token }
          )
          dispatch({ type: 'emailUniqueResults', value: response.data })
        } catch (err) {
          console.error('Server Error', err)
        }
      }
      fetchData()
      return () => myRequest.cancel()
    }
  }, [state.email.checkCount])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: 'passwordAfterDelay' }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.submitCount) {
      const myRequest = axios.CancelToken.source()
      const fetchData = async () => {
        try {
          const response = await axios.post(
            '/register',
            { username: state.username.value, email: state.email.value, password: state.password.value },
            { cancelToken: myRequest.token }
          )
          appDispatch({ type: 'login', data: response.data })
          appDispatch({ type: 'flashMessage', value: 'Bienvenue sur notre site!' })
        } catch (err) {
          console.error('Server Error', err)
        }
      }
      fetchData()
      return () => myRequest.cancel()
    }
  }, [state.submitCount])

  const handleSubmit = e => {
    e.preventDefault()
    dispatch({ type: 'usernameAfterDelay', value: state.username.value })
    dispatch({ type: 'emailAfterDelay', value: state.email.value })
    dispatch({ type: 'passwordAfterDelay', value: state.password.value })
    dispatch({ type: 'submitForm' })
  }

  return (
    <Page title='Welcome'>
      <div className='row align-items-center'>
        <div className='col-lg-7 py-3 py-md-5'>
          <h1 className='display-3'>Remember Writing?</h1>
          <p className='lead text-muted'>
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late
            90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet
            again.
          </p>
        </div>
        <div className='col-lg-5 pl-lg-5 pb-3 py-lg-5'>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='username-register' className='text-muted mb-1'>
                <small>Pseudo</small>
              </label>
              <input
                id='username-register'
                onChange={e => dispatch({ type: 'usernameImmediately', value: e.target.value })}
                name='username'
                className='form-control'
                type='text'
                placeholder='Pick a username'
                autoComplete='off'
              />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.username.errorMessage}</div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='email-register' className='text-muted mb-1'>
                <small>Email</small>
              </label>
              <input
                id='email-register'
                onChange={e => dispatch({ type: 'emailImmediately', value: e.target.value })}
                name='email'
                className='form-control'
                type='text'
                placeholder='you@example.com'
                autoComplete='off'
              />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.email.errorMessage}</div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='password-register' className='text-muted mb-1'>
                <small>Password</small>
              </label>
              <input
                id='password-register'
                onChange={e => dispatch({ type: 'passwordImmediately', value: e.target.value })}
                name='password'
                className='form-control'
                type='password'
                placeholder='Create a password'
              />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.password.errorMessage}</div>
              </CSSTransition>
            </div>
            <button type='submit' className='py-3 mt-4 btn btn-lg btn-success btn-block'>
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
