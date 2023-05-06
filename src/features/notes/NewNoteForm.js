import { useState, useEffect } from 'react'
import { useAddNewNoteMutation } from './notesApiSlice'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const TEXT_REGEX = /[\S\s]+[\S]+/

const NewNoteForm = ({ users }) => {
  const [addNewNote, { isLoading, isSuccess, isError, error }] =
    useAddNewNoteMutation()

  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [completed, setCompleted] = useState(false)
  const [userId, setUserId] = useState('')
  const [validTitle, setValidTitle] = useState(false)
  const [validText, setValidText] = useState(false)

  useEffect(() => {
    setValidTitle(TEXT_REGEX.test(title))
  }, [title])

  useEffect(() => {
    setValidText(TEXT_REGEX.test(text))
  }, [text])

  useEffect(() => {
    if (isSuccess) {
      setTitle('')
      setText('')
      setCompleted(false)
      setUserId('')
      navigate('/dash/notes')
    }
  }, [isSuccess, navigate])

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onTextChanged = (e) => setText(e.target.value)
  const onUserIdChange = (e) => setUserId(e.target.value)

  const canSave = [validText, validTitle, userId].every(Boolean) && !isLoading

  const onSaveNoteClicked = async (e) => {
    e.preventDefault()
    if (canSave) {
      await addNewNote({ user: userId, title, text, completed })
    }
  }
  const options = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.username}
    </option>
  ))

  const errClass = isError ? 'errmsg' : 'offscreen'
  const validTitleClass = !validTitle ? 'form__input--incomplete' : ''
  const validTextClass = !validText ? 'form__input--incomplete' : ''
  const validUserId = !userId ? 'form__input--incomplete' : ''

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>

      <form className='form' onSubmit={onSaveNoteClicked}>
        <div className='form__title_row'>
          <h2>New Note</h2>
          <div className='form__action-buttons'>
            <button className='icon-button' title='save' disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>
        <label className='form__label' htmlFor='title'>
          Title: <span className='nowrap'>[Must not be empty]</span>
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id='title'
          name='title'
          type='text'
          autoComplete='off'
          value={title}
          onChange={onTitleChanged}
        />
        <label className='form__label' htmlFor='text'>
          Content: <span className='nowrap'>[Must not be empty]</span>
        </label>
        <input
          className={`form__input ${validTextClass}`}
          id='text'
          name='text'
          type='text'
          autoComplete='off'
          value={text}
          onChange={onTextChanged}
        />
        <label className='form__label' htmlFor='userId'>
          ASSIGNED USER:
        </label>
        <select
          id='userId'
          name='userId'
          className={`form__select ${validUserId}`}
          value={userId}
          onChange={onUserIdChange}
        >
          <option value=''></option>
          {options}
        </select>
      </form>
    </>
  )

  return content
}
export default NewNoteForm
