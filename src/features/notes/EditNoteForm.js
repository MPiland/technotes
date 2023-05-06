import { useEffect, useState } from 'react'
import { useUpdateNoteMutation, useDeleteNoteMutation } from './notesApiSlice'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import useAuth from '../../hooks/useAuth'

const TEXT_REGEX = /[\S\s]+[\S]+/

const EditNoteForm = ({ users, note }) => {
  const { isManager, isAdmin } = useAuth()

  const [updateNote, { isLoading, isSuccess, isError, error }] =
    useUpdateNoteMutation()

  const [
    deleteNote,
    { isSuccess: isDelSuccess, isError: isDelError, error: delError },
  ] = useDeleteNoteMutation()

  const navigate = useNavigate()

  const [title, setTitle] = useState(note.title)
  const [text, setText] = useState(note.text)
  const [completed, setCompleted] = useState(note.completed)
  const [userId, setUserId] = useState(note.user)
  const [validTitle, setValidTitle] = useState(false)
  const [validText, setValidText] = useState(false)

  useEffect(() => {
    setValidText(TEXT_REGEX.test(text))
  }, [text])

  useEffect(() => {
    setValidTitle(TEXT_REGEX.test(title))
  }, [title])

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setTitle('')
      setText('')
      setCompleted(false)
      setUserId('')
      navigate('/dash/notes')
    }
  }, [isSuccess, isDelSuccess, navigate])

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onTextChanged = (e) => setText(e.target.value)
  const onUserIdChange = (e) => setUserId(e.target.value)
  const onCompletedChanged = (e) => setCompleted((prev) => !prev)

  const canSave = [validText, validTitle, userId].every(Boolean) && !isLoading

  const onSaveNoteClicked = async (e) => {
    console.log(completed)
    if (canSave) {
      await updateNote({ id: note.id, user: userId, title, text, completed })
    }
  }

  const onDeleteNoteClicked = async () => {
    await deleteNote({ id: note.id })
  }

  const created = new Date(note.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })

  const updated = new Date(note.updatedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })

  const options = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.username}
    </option>
  ))

  const errClass = isError || isDelError ? 'errmsg' : 'offscreen'
  const validTitleClass = !validTitle ? 'form__input--incomplete' : ''
  const validTextClass = !validText ? 'form__input--incomplete' : ''
  const validUserId = !userId ? 'form__input--incomplete' : ''

  const errContent = (error?.data.message || delError?.data?.message) ?? ''

  let deleteButton = null
  if (isManager || isAdmin) {
    deleteButton = (
      <button
        className='icon-button'
        title='delete'
        onClick={onDeleteNoteClicked}
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    )
  }

  const content = (
    <>
      <p className={errClass}>{errContent}</p>

      <form className='form' onSubmit={onSaveNoteClicked}>
        <div className='form__title_row'>
          <h2>New Note</h2>
          <div className='form__action-buttons'>
            <button className='icon-button' title='save' disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
            {deleteButton}
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
        <div className='form__row'>
          <div className='form__divider'>
            <label
              className='form__label form__checkbox-container'
              htmlFor='note-complete'
            >
              COMPLETED:
              <input
                className='form__checkbox'
                id='note-complete'
                name='note-complete'
                type='checkbox'
                checked={completed}
                onChange={onCompletedChanged}
              />
            </label>
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
          </div>
          <div className='form__divider'>
            <p className='form__created'>
              Created:
              <br />
              {created}
            </p>
            <p className='form__created'>
              Updated:
              <br />
              {updated}
            </p>
          </div>
        </div>
      </form>
    </>
  )

  return content
}
export default EditNoteForm
