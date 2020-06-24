import React, { useEffect, useContext } from 'react'
import { useParams, Link, withRouter } from 'react-router-dom'
import { useImmerReducer } from 'use-immer'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import axios from 'axios'
import Page from './Page'
import LoadingIcon from './LoadingIcon'
import NotFound from './NotFound'

const EditPost = props => {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const initState = {
    title: {
      value: '',
      hasErrors: false,
      message: ''
    },
    body: {
      value: '',
      hasErrors: false,
      message: ''
    },
    isLoading: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isLoading = false
        break
      case 'changeTitle':
        draft.title.hasErrors = false
        draft.title.value = action.value
        break
      case 'changeBody':
        draft.body.hasErrors = false
        draft.body.value = action.value
        break
      case 'submitChanges':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        break
      case 'saveRequestStarted':
        draft.isSaving = true
        break
      case 'saveRequestFinished':
        draft.isSaving = false
        break
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'Vous devez entrer un titre.'
        }
        break
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'Veuillez entrer du texte.'
        }
        break
      case 'notFound':
        draft.notFound = true
        break
      default:
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${state.id}`, {
          cancelToken: myRequest.token
        })
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data })
          if (appState.user.username !== response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: "Vous n'avez pas la permission d'éditer ce message."
            })
            // Redirect to homepage
            props.history.push('/')
          }
        } else {
          dispatch({ type: 'notFound' })
        }
      } catch (err) {
        console.error('Server Error, or the Request was Cancelled', err)
      }
    }
    fetchPost()
    return () => {
      myRequest.cancel()
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' })
      const myRequest = axios.CancelToken.source()
      const fetchPost = async () => {
        try {
          await axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token
            },
            {
              cancelToken: myRequest.token
            }
          )
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post was updated' })
        } catch (err) {
          console.error('Server Error, or the Request was Cancelled', err)
        }
      }
      fetchPost()
      return () => {
        myRequest.cancel()
      }
    }
    // eslint-disable-next-line
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isLoading) {
    return (
      <Page title='Loading...' narrow>
        <LoadingIcon />
      </Page>
    )
  }

  const handleSubmit = e => {
    e.preventDefault()
    dispatch({ type: 'titleRules', value: state.title.value })
    dispatch({ type: 'bodyRules', value: state.body.value })
    dispatch({ type: 'submitChanges' })
  }

  return (
    <Page title='Edit Post' narrow>
      <Link className='small' to={`/post/${state.id}`}>
        &laquo; Retour au permalink
      </Link>
      <form className='mt-3' onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            autoFocus
            value={state.title.value}
            onChange={e =>
              dispatch({ type: 'changeTitle', value: e.target.value })
            }
            onBlur={e =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
          />
          {state.title.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.title.message}
            </div>
          )}
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            value={state.body.value}
            onChange={e =>
              dispatch({ type: 'changeBody', value: e.target.value })
            }
            onBlur={e => dispatch({ type: 'bodyRules', value: e.target.value })}
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
          />
          {state.body.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.body.message}
            </div>
          )}
        </div>

        <button className='btn btn-primary' disabled={state.isSaving}>
          {!state.isSaving ? 'Save Updates' : 'Saving...'}
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
