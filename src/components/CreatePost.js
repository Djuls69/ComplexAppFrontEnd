import React, { useState, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import axios from 'axios'
import Page from './Page'

const CreatePost = ({ history }) => {
  const [title, setTitle] = useState()
  const [body, setBody] = useState()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const token = appState.user.token

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const response = await axios.post('/create-post', {
        title,
        body,
        token
      })
      // Redirect to new post url
      // addFlashMessage('Post successfuly created!')
      appDispatch({
        type: 'flashMessage',
        value: 'Congrats, post successfuly created!'
      })
      history.push(`post/${response.data}`)
    } catch (err) {
      console.error('Error!', err)
    }
  }

  return (
    <Page title='New Post' narrow>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            autoFocus
            onChange={e => setTitle(e.target.value)}
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
          />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            onChange={e => setBody(e.target.value)}
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
          ></textarea>
        </div>

        <button className='btn btn-primary'>Save New Post</button>
      </form>
    </Page>
  )
}

export default withRouter(CreatePost)
