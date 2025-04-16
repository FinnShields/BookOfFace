import { useState, useEffect } from "react"
import axios from 'axios'
import Select from 'react-select'

const apiUrl = 'http://localhost:3001/api/users'
const imgUrl = 'http://localhost:3001/uploads'

const LogIn = (props) => {
  if (props.loggedIn) {
    const imageSource = (props.loggedIn.picture)
      ? `${imgUrl}/${props.loggedIn.picture}`
      : `${imgUrl}/default.jpg`
    return (<>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
    <img src={imageSource} height={50} width={50} style={{ alignSelf: 'center' }} />
    <p>Logged in as {props.loggedIn.username}</p>
    <button onClick={props.logOut}>Log out</button>
    </div>
    </>)
  }
  return (
    <>
    <form onSubmit={props.attemptLogIn}>
      <div>
        username: <input value={props.usernameInput} onChange={props.handleUsernameInput} />
      </div>
      <div>
        password: <input value={props.passwordInput} onChange={props.handlePasswordInput} />
      </div>
      <div>
        <button type="submit">Log in</button>
        <button onClick={props.createNewUser}>Create new account</button>
      </div>
    </form>
    
    </>
  )
}

const Comments = (props) => {
  const comments = props.profileToDisplay.comments
  const nothingToDisplay = (comments.length === 0) ? 'Nothing to display...' : ''
  return (
    <>
    <h3>Comments</h3>
    <p><i>{nothingToDisplay}</i></p>
    <ul>{comments.map(c =>
      <li key={c.comment}><b>{c.author}: </b>{c.comment}</li>)}
    </ul>
    <form onSubmit={props.addComment}>
      <input value={props.comment} onChange={props.handleComment}
      placeholder="Add a comment"></input>
      <button type="submit">Submit</button>
    </form>
    </>)
}

const EditMode = (props) => {
  return (
    <>
    <h2>{props.profileToDisplay.username}</h2>
    <p>Edit catchphrase?</p>
    <input value={props.slogan} onChange={props.handleSlogan}
      placeholder={props.profileToDisplay.catchphrase}></input>
    <input
      name="image"
      type="file"
      id="upload-button"
      style={{ dispaly: 'none'}}
      onChange={props.handlePhotoChange}
      />
    <label htmlFor="upload-button">
      {props.image.preview ? (
        <img
          src={props.image.preview}
          alt="dummy"
          width="100"
          height="100"
          className="my-10 mx-5"
          />
      ) : (
        <>
        <p className="text-white text-1xl text-left w-full text-left">
          Upload image
          </p>
          <div />
          </>
      )}
    </label>
    <button
      type="button"
      onClick={props.submit}
      className="text-white w-full mt-2 border-[1px]
      p-2 border-[#3d4f7c] rounded-full cursor-pointer ">
    Submit
    </button>
    <div><button onClick={props.updateProfile}>Save changes</button></div>
    </>
  )
}


const DisplayProfile = (props) => {
  if (!props.loggedIn)
    return (<><h3>{props.users.length} profiles exist</h3>
    <p>Please log in to view profiles</p></>)
  else if (props.editMode)
    return <EditMode {...props}/>
  else {
    const editButton = (props.loggedIn.username === props.profileToDisplay.username)
      ? <button onClick={props.handleEditMode}>Edit profile</button> : null
    const options = props.users.map(user => ({
      value: user,
      label: user.username
    }))
    const imageSource = (props.profileToDisplay.picture)
      ? `${imgUrl}/${props.profileToDisplay.picture}`
      : `${imgUrl}/default.jpg`
    return (
      <>
      <Select options={options}
        isSearchable
        placeholder="View a profile..."
        onChange={props.handleUserSearch}/>
      <div>{editButton}</div>
      <h2>{props.profileToDisplay.username}</h2>
      <img src={imageSource} height={250} width={250} />
      <p>"<i>{props.profileToDisplay.catchphrase}</i>"</p>
      <Comments {...props}/>
      </>
    )
  }
}

const  App = () => {
  const [users, setUsers] = useState([])
  const [loggedIn, setLoggedIn] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [profileToDisplay, setProfileToDisplay] = useState(null)
  const [comment, setComment] = useState('')
  const [slogan, setSlogan] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [image, setImage] = useState({
    preview: '',
    raw: '',
  })
  const [imageName, setImageName] = useState('')

  useEffect(() => {
    axios
      .get(apiUrl)
      .then(response => {
        setUsers(response.data)
      })
  }, [loggedIn])

  const handleUsernameInput = (event) => {
    setUsernameInput(event.target.value)
  }

  const handlePasswordInput = (event) => {
    setPasswordInput(event.target.value)
  }

  const handleComment = (event) => {
    setComment(event.target.value)
  }

  const handleSlogan = (event) => {
    setSlogan(event.target.value)
  }

  const handleEditMode = (event) => {
    event.preventDefault()
    setEditMode(true)
  }

  const addComment = (event) => {
    event.preventDefault()
    if (!comment)
      return
    axios.post(`${apiUrl}/${profileToDisplay.id}/addcomment`,
      {'comment': comment, 'author': loggedIn.username})
    .then(response => {
      setUsers(users.map(user => user.id === response.data.id ? response.data : user))
      setProfileToDisplay(response.data)
    })
    .catch(error => {
      alert(error.response.data.error)
    })
    console.log(`New comment: ${comment} by ${loggedIn.username}`)
    setComment('')

  }

  const updateProfile = (event) => {
    event.preventDefault()
    const newProfile = {
      'username': loggedIn.username,
      'catchphrase': slogan ? slogan : loggedIn.catchphrase,
      'id': loggedIn.id,
      'password': loggedIn.password,
      'comments': loggedIn.comments,
      'picture': imageName ? imageName : loggedIn.picture
    }
    axios
      .put(`${apiUrl}/${loggedIn.id}`, newProfile)
      .then(response => {
        setUsers(users.map(user => user.id === response.data.id ? response.data : user))
        setLoggedIn(response.data)
        setProfileToDisplay(response.data)
        alert(`Successfully updated ${loggedIn.username}'s profile!`)
        setSlogan('')
        setEditMode(false)
        setImageName('')
        setImage({
          preview: '',
          raw: '',
        })
      })
      .catch(error => {
        alert(error.response.data.error)
      })
  }

  const handleUserSearch = (selectedProfile) => {
    if (selectedProfile)
      setProfileToDisplay(selectedProfile.value)
  }

  const attemptLogIn = (event) => {
    event.preventDefault()
    const match = users.find(user => user.username === usernameInput 
      && user.password === passwordInput)
    if (!match) {
      alert('Incorrect username or password')
      setUsernameInput('')
      setPasswordInput('')
    }
    else {
      setLoggedIn(match)
      setProfileToDisplay(match)
    }
  }

  const logOut = (event) => {
    event.preventDefault()
    setLoggedIn(null)
    setUsernameInput('')
    setPasswordInput('')
  }

  const createNewUser = (event) => {
    event.preventDefault()
    const newUser = {
      username: usernameInput,
      password: passwordInput,
      catchphrase: "",
      picture: "",
      comments: []
    }
    axios.post(apiUrl, newUser)
    .then(response => {
      setLoggedIn(response.data)
      setProfileToDisplay(response.data)
    })
    .catch(error => {
      alert(error.response.data.error)
    })
  }

  const handlePhotoChange = (event) => {
    if (event.target.files.length) {
      setImage({
        preview: URL.createObjectURL(event.target.files[0]),
        raw: event.target.files[0]
      })
    }
  }

  const submit = async () => {
    let formData = new FormData()
    formData.append('image', image.raw)
    await axios
      .post(`${apiUrl}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      .then(response => {
        setImageName(response.data.filename)
        return response.data
      })
      .catch(error => {

        alert(`Image upload error`)
      })
  }
  const loggedInProps = {logOut, usernameInput, handleUsernameInput, passwordInput, handlePasswordInput,
    attemptLogIn, createNewUser, users, loggedIn}
  const displayProfileProps = {users, loggedIn, profileToDisplay, handleUserSearch,
    addComment, comment, handleComment, editMode, handleEditMode, handleSlogan, updateProfile,
    handlePhotoChange, submit, image}

  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    <h1>Book of Face</h1>
    <LogIn {...loggedInProps}/>
    </div>
    <DisplayProfile {...displayProfileProps}/>
    </>
  )
}

export default App
