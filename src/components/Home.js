import React, { useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import axios from 'axios'
import StateContext from '../StateContext'
import Page from './Page'
import LoadingIcon from './LoadingIcon'
import Post from './Post'

const Home = () => {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  })

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchPosts = async () => {
      const response = await axios.post('/getHomeFeed', {
        token: appState.user.token,
        cancelToken: myRequest.token
      })
      setState(draft => {
        draft.isLoading = false
        draft.feed = response.data
      })
    }
    fetchPosts()
    // eslint-disable-next-line
  }, [])

  if (state.isLoading) {
    return <LoadingIcon />
  }

  return (
    <Page title='Your Feed' narrow>
      {Boolean(state.feed.length) && (
        <>
          <h2 className='text-center mb-4'>Dernières activités de vos contacts.</h2>
          <div className='list-group'>
            {state.feed.map(post => {
              return <Post key={post._id} post={post} />
            })}
          </div>
        </>
      )}
      {!Boolean(state.feed.length) && (
        <>
          <h2 className='text-center'>
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className='lead text-muted text-center'>
            Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to
            follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content
            written by people with similar interests and then follow them.
          </p>
        </>
      )}
    </Page>
  )
}

export default Home
