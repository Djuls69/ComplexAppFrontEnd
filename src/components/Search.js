import React, { useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import axios from 'axios'
import DispatchContext from '../DispatchContext'
import Post from './Post'

const Search = () => {
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'rien',
    requestCount: 0
  })

  useEffect(() => {
    document.addEventListener('keydown', searchKeypressHandler)
    return () => document.removeEventListener('keydown', searchKeypressHandler)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = 'loading'
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 750)

      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = 'rien'
      })
    }
  }, [setState, state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = axios.CancelToken.source()
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            '/search',
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          )
          setState(draft => {
            draft.results = response.data
            draft.show = 'results'
          })
        } catch (err) {
          console.error('Server error, or the request was cancelled', err)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [setState, state.requestCount, state.searchTerm])

  const searchKeypressHandler = e => {
    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' })
    }
  }

  const handleInput = e => {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className='search-overlay'>
      <div className='search-overlay-top shadow-sm'>
        <div className='container container--narrow'>
          <label htmlFor='live-search-field' className='search-overlay-icon'>
            <i className='fas fa-search'></i>
          </label>
          <input
            autoFocus
            type='text'
            autoComplete='off'
            id='live-search-field'
            className='live-search-field'
            placeholder='Que recherchez-vous?'
            onChange={handleInput}
          />
          <span
            onClick={() => appDispatch({ type: 'closeSearch' })}
            className='close-live-search'
          >
            <i className='fas fa-times-circle'></i>
          </span>
        </div>
      </div>

      <div className='search-overlay-bottom'>
        <div className='container container--narrow py-3'>
          <div
            className={`circle-loader ${
              state.show === 'loading' ? 'circle-loader--visible' : ''
            }`}
          ></div>
          <div
            className={`live-search-results ${
              state.show === 'results' ? 'live-search-results--visible' : ''
            }`}
          >
            {Boolean(state.results.length) && (
              <div className='list-group shadow-sm'>
                <div className='list-group-item active'>
                  <strong>Votre Recherche</strong>{' '}
                  {`( ${state.results.length} ${
                    state.results.length > 1 ? 'résultats' : 'résultat'
                  } )`}
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      key={post._id}
                      post={post}
                      onClick={() => appDispatch({ type: 'closeSearch' })}
                    />
                  )
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className='alert alert-danger text-center shadow-sm'>
                Aucun résultat avec cette recherche.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
