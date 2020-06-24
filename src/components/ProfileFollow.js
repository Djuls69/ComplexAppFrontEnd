import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import LoadingIcon from './LoadingIcon'

const ProfileFollow = ({ action }) => {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/${action}`, {
          cancelToken: myRequest.token
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (err) {
        console.error('Server error, or request cancelled')
      }
    }
    fetchPosts()
    return () => {
      myRequest.cancel()
    }
  }, [username, action])

  if (isLoading) return <LoadingIcon />

  return (
    <div className='list-group'>
      {posts.map((follower, idx) => {
        return (
          <Link
            key={idx}
            to={`/profile/${follower.username}`}
            className='list-group-item list-group-item-action'
          >
            <img
              className='avatar-tiny'
              src={follower.avatar}
              alt={follower.username}
            />{' '}
            <span>{follower.username}</span>{' '}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollow
