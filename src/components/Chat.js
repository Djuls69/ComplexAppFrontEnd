import React, { useContext, useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

const socket = io(process.env.BACKENDURL || 'https://mycomplexapp-backend.herokuapp.com')

const Chat = () => {
  const chatField = useRef(null)
  const chatLog = useRef(null)
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessages: []
  })

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus()
      appDispatch({ type: 'clearUnreadChatCount' })
    }
    // eslint-disable-next-line
  }, [appState.isChatOpen])

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: 'incrementUnreadChatCount' })
    }
    // eslint-disable-next-line
  }, [state.chatMessages])

  useEffect(() => {
    socket.on('chatFromServer', message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
    // eslint-disable-next-line
  }, [])

  const handleFieldChange = e => {
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })
  }

  const handleSubmit = e => {
    e.preventDefault()

    socket.emit('chatFromBrowser', {
      message: state.fieldValue,
      token: appState.user.token
    })

    setState(draft => {
      draft.chatMessages.push({
        message: draft.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar
      })
      draft.fieldValue = ''
    })
  }

  return (
    <div
      id='chat-wrapper'
      className={`chat-wrapper shadow border-top border-left border-right ${
        appState.isChatOpen ? 'chat-wrapper--is-visible' : ''
      }`}
    >
      <div className='chat-title-bar bg-primary'>
        Chat
        <span onClick={() => appDispatch({ type: 'closeChat' })} className='chat-title-bar-close'>
          <i className='fas fa-times-circle'></i>
        </span>
      </div>
      <div ref={chatLog} id='chat' className='chat-log'>
        {state.chatMessages.map((message, idx) => {
          if (message.username === appState.user.username) {
            return (
              <div key={idx} className='chat-self'>
                <div className='chat-message'>
                  <div className='chat-message-inner'>{message.message}</div>
                </div>
                <img className='chat-avatar avatar-tiny' src={message.avatar} alt={message.username} />
              </div>
            )
          }
          return (
            <div key={idx} className='chat-other'>
              <Link to={`/profile/${message.username}`}>
                <img className='avatar-tiny' src={message.avatar} alt={message.username} />
              </Link>
              <div className='chat-message'>
                <div className='chat-message-inner'>
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username} :</strong>
                  </Link>{' '}
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit} id='chatForm' className='chat-form border-top'>
        <input
          ref={chatField}
          onChange={handleFieldChange}
          value={state.fieldValue}
          type='text'
          className='chat-field'
          id='chatField'
          placeholder='Type a message…'
          autoComplete='off'
        />
      </form>
    </div>
  )
}

export default Chat
