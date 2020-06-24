import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import Page from './Page'
import LoadingIcon from './LoadingIcon'
import NotFound from './NotFound'

import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

const ViewSinglePost = props => {
  const postID = useParams().id
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${postID}`, {
          cancelToken: myRequest.token
        })
        setPost(response.data)
        setIsLoading(false)
      } catch (err) {
        console.error('Server Error, or the Request was Cancelled', err)
      }
    }
    fetchPost()
    return () => {
      myRequest.cancel()
    }
  }, [postID])

  if (isLoading) {
    return (
      <Page title='Loading...' narrow>
        <LoadingIcon />
      </Page>
    )
  }

  if (!isLoading && !post) {
    return <NotFound />
  }

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`

  const isOwner = () => {
    if (appState.loggedIn && appState.user.username === post.author.username) {
      return true
    }
    return false
  }

  const handleDelete = async () => {
    const confirmation = window.confirm('Attention, ce choix est définitif!')
    if (confirmation) {
      try {
        const response = await axios.delete(`/post/${post._id}`, {
          data: { token: appState.user.token }
        })
        if (response.data === 'Success') {
          appDispatch({ type: 'flashMessage', value: 'Post bien supprimé.' })
          props.history.push(`/profile/${appState.user.username}`)
        } else {
          appDispatch({
            type: 'flashMessage',
            value: 'Problème serveur, veuillez réessayer plus tard.'
          })
        }
      } catch (err) {
        console.log('Server Error', err)
      }
    }
  }

  return (
    <Page title={post.title} narrow>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link
              to={`/post/${post._id}/edit`}
              data-tip='Edit'
              data-for='edit'
              className='text-primary mr-2'
            >
              <i className='fas fa-edit'></i>
            </Link>
            <ReactTooltip id='edit' className='custom-tooltip' />{' '}
            <button
              onClick={handleDelete}
              data-tip='Delete'
              data-for='delete'
              className='delete-post-button text-danger'
            >
              <i className='fas fa-trash'></i>
            </button>
            <ReactTooltip id='delete' className='custom-tooltip' />
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img
            className='avatar-tiny'
            src={post.author.avatar}
            alt='avatar-tiny'
          />
        </Link>
        Posted by{' '}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>
        {` on ${dateFormatted}`}
      </p>

      <div className='body-content'>
        <ReactMarkdown source={post.body} />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
