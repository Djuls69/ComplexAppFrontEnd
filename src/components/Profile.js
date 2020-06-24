import React, { useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import { useParams, NavLink, Switch, Route } from 'react-router-dom'
import StateContext from '../StateContext'
import axios from 'axios'
import Page from './Page'
import ProfilePost from './ProfilePost'
import ProfileFollow from './ProfileFollow'

const Profile = () => {
  const { username } = useParams()
  const appState = useContext(StateContext)

  const profileData = {
    profileUsername: 'Loading User ...',
    profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
    isFollowing: false,
    counts: {
      followerCount: '0',
      followingCount: '0',
      postCount: '0'
    }
  }

  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData
  })

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchData = async () => {
      try {
        const response = await axios.post(`/profile/${username}`, {
          cancelToken: myRequest.token,
          token: appState.user.token
        })
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (err) {
        console.error('There was a problem!', err)
      }
    }
    fetchData()
    return () => {
      myRequest.cancel()
    }
    // eslint-disable-next-line
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const myRequest = axios.CancelToken.source()
      const fetchData = async () => {
        try {
          await axios.post(`/addFollow/${state.profileData.profileUsername}`, {
            cancelToken: myRequest.token,
            token: appState.user.token
          })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (err) {
          console.error('There was a problem!', err)
        }
      }
      fetchData()
      return () => {
        myRequest.cancel()
      }
    }
    // eslint-disable-next-line
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const myRequest = axios.CancelToken.source()
      const fetchData = async () => {
        try {
          await axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              cancelToken: myRequest.token,
              token: appState.user.token
            }
          )
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (err) {
          console.error('There was a problem!', err)
        }
      }
      fetchData()
      return () => {
        myRequest.cancel()
      }
    }
    // eslint-disable-next-line
  }, [state.stopFollowingRequestCount])

  const startFollowing = () => {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  const stopFollowing = () => {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title={`${appState.user.username} profile`} narrow>
      <h2>
        <img
          className='avatar-small'
          src={state.profileData.profileAvatar}
          alt='avatar-small'
        />{' '}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username !== state.profileData.profileUsername &&
          state.profileData.profileUsername !== 'Loading User ...' && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className='btn btn-primary btn-sm ml-2'
            >
              Follow <i className='fas fa-user-plus'></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username !== state.profileData.profileUsername &&
          state.profileData.profileUsername !== 'Loading User ...' && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className='btn btn-danger btn-sm ml-2'
            >
              Stop Following <i className='fas fa-user-times'></i>
            </button>
          )}
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className='nav-item nav-link'
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className='nav-item nav-link'
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className='nav-item nav-link'
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Switch>
        <Route exact path='/profile/:username'>
          <ProfilePost />
        </Route>
        <Route path='/profile/:username/followers'>
          <ProfileFollow action='followers' />
        </Route>
        <Route path='/profile/:username/following'>
          <ProfileFollow action='following' />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
