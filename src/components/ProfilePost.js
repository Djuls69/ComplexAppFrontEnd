import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Post from './Post'
import LoadingIcon from './LoadingIcon'

const ProfilePost = () => {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const myRequest = axios.CancelToken.source()
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/posts`, {
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
  }, [username])

  if (isLoading) return <LoadingIcon />

  return (
    <div className='list-group'>
      {posts.map(post => {
        return <Post key={post._id} post={post} />
      })}
    </div>
  )
}

export default ProfilePost
