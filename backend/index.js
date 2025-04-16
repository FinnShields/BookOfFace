const express = require('express')
const cors = require('cors')
const path = require('path')
const multer = require('multer')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg') {
            cb(null, true)
        } else {
            cb(null, false)
            return cb(new Error('Only .png, .jpg and .jpeg allowed'))
        }
    }
})

const uploadImage = upload.single('image')

let data = [
    {
        "username": "Finn",
        "password": "123",
        "catchphrase": "Will somebody think of the mats?!",
        "comments": [{'comment': 'The microbial mats were here first..',
                        'author': 'Everyone'}],
        "picture": "Hamster.jpg",
        "id": "1"
    },
    {
        "username": "Verohallitus",
        "password": "123",
        "catchphrase": "That's my bike pump.. now",
        "comments" : [],
        "picture": "",
        "id": "2"
    },
    {
        "username": "Elintarvikeliitto",
        "password": "123",
        "catchphrase": "It's good our son doesn't visit more often",
        "comments" : [],
        "picture": "",
        "id": "3"
    }
]

app.get('/api/users', (request, response) => {
    response.json(data)
})

app.get('/api/users/:id', (request, response) => {
    const id = request.params.id
    const toShow = data.find(user => user.id === id)
    if (toShow)
        response.json(toShow)
    else
        response.status(404).end(`No user with id ${id}`)
})

app.post('/api/users', (request, response) => {
    const body = request.body
    if (!body.username)
        return response.status(400).json({error: "missing username"})
    if (data.find(user => user.username === body.username))
        return response.status(400).json({error: "User already exists"})
    const newUser = {
        username: body.username,
        password: body.password,
        catchphrase: body.catchphrase,
        comments: body.comments,
        id: (Math.floor(Math.random() * 1000000000)).toString()
    }
    data = data.concat(newUser)
    response.json(newUser).end()
})

app.post('/api/users/:id/addcomment', (request, response) => {
    const id = request.params.id
    const body = request.body
    const user = data.find(u => u.id === id)
    if (!user)
        return response.status(400).json({error: "No such user"})
    if (!body.comment)
        return response.status(400).json({error: "missing comment"})
    user.comments = user.comments.concat(body)
    data = data.map(u => u.id === id ? user : u)
    response.json(user).end()
})

app.put('/api/users/:id', (request, response) => {
    const id = request.params.id
    const body = request.body
    const user = data.find(u => u.id === id)
    if (!user || user.id !== body.id)
        return response.status(400).json({error: 'Bad request'})
    data = data.map(u => u.id === id ? body : u)
    response.json(body).end()
})

app.post('/api/users/image', uploadImage, (request, response) => {
    if (!request.file) {
        return response.status(400).send({ message: 'file error' })
    }
    response.json(request.file)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})


