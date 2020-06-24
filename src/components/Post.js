import React from 'react'
import { Link } from 'react-router-dom'

const Post = ({ post, onClick }) => {
  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`

  return (
    <Link
      key={post._id}
      to={`/post/${post._id}`}
      onClick={onClick}
      className='list-group-item list-group-item-action'
    >
      <img
        className='avatar-tiny'
        src={post.author.avatar}
        alt={post.author.username}
      />{' '}
      <span>{post.title}</span>{' '}
      <span className='text-muted small'>
        by {post.author.username} on {dateFormatted}
      </span>
    </Link>
  )
}

export default Post
