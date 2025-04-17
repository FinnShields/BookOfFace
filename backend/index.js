const express = require('express')
const cors = require('cors')
const path = require('path')
const multer = require('multer')
const db = require('./db')

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

app.get('/api/users', async (request, response) => {
    let conn
    try {
        conn = await db.getConnection()
        const rows = await db.query(`
            SELECT
                users.id AS user_id,
                users.username,
                users.password,
                users.catchphrase,
                users.picture,
                comments.comment,
                comments.author
            FROM users
            LEFT JOIN comments ON users.id = comments.user_id
            `)
        const usersMap = {}
        rows.forEach(row => {
            const id = row.user_id
            if (!usersMap[id]) {
                usersMap[id] = {
                    id: id.toString(),
                    username: row.username,
                    catchphrase: row.catchphrase,
                    password: row.password,
                    picture: row.picture,
                    comments: []
                }
            }
            if (row.comment !== null) {
                usersMap[id].comments.push({
                    comment: row.comment,
                    author: row.author
                })
            }
        })
        const users = Object.values(usersMap)
        response.json(users)
    } catch (err) {
        response.status(500).end('db error')
    } finally {
        if (conn)
            conn.release()
    }
})

app.post('/api/users', async (request, response) => {
    const body = request.body
    if (!body.username || !body.password)
        return response.status(400).json({error: "missing username or password"})
    let conn
    try {
        conn = await db.getConnection()
        const existingUsers = await conn.query(
            `SELECT id FROM users WHERE username = ?`,
            [body.username]
        )
        if (existingUsers.length > 0)
            return response.status(409).json({ error: 'Username already taken' })
        const result = await conn.query(
            `INSERT INTO users (username, password, catchphrase, picture)
            VALUES (?, ?, ?, ?)`,
            [body.username, body.password, '', '']
        )
        const newId = result.insertId
        response.status(201).json({
            username: body.username,
            password: body.password,
            catchphrase: '',
            picture: '',
            comments: [],
            id: newId.toString()
        })
    } catch (err) {
        console.error('User insert error:', err)
        response.status(500).json({ error: 'db error' })
    } finally {
        if (conn)
            conn.release()
    }
})

app.post('/api/users/:id/addcomment', async (request, response) => {
    const id = request.params.id
    const body = request.body
    let conn
    try {
        conn = await db.getConnection()
        const userCheck = await conn.query(
            `SELECT id FROM users WHERE id = ?`,
            [id]
        )
        if (userCheck.length === 0)
            return response.status(404).json({error: 'no user by that id' })
        await conn.query(
            `INSERT INTO comments (user_id, comment, author)
            VALUES (?, ?, ?)`,
            [id, body.comment, body.author]
        )
        const userData = await conn.query(
            `SELECT
                u.id AS user_id,
                u.username,
                u.catchphrase,
                u.picture,
                c.comment,
                c.author
            FROM users u
            LEFT JOIN comments c ON u.id = c.user_id
            WHERE u.id = ?`,
            [id]
        )
        if (userData.length === 0)
            return response.status(404).json({ error: 'User not found' })
        const user = {
            id: userData[0].user_id.toString(),
            username: userData[0].username,
            catchphrase: userData[0].catchphrase,
            picture: userData[0].picture,
            comments: []
        }
        userData.forEach(row => {
            if (row.comment !== null) {
                user.comments.push({
                    comment: row.comment,
                    author: row.author
                })
            }
        })
        response.status(201).json(user)
    } catch (err) {
        console.error('Error getting user with comments', err)
        response.status(500).json({ error: 'db error' })
    } finally {
        if (conn)
            conn.release()
    }
})

app.put('/api/users/:id', async (request, response) => {
    const id = request.params.id
    const body = request.body
    const updates = []
    const values = []

    if (body.catchphrase !== undefined) {
        updates.push('catchphrase = ?')
        values.push(body.catchphrase)
    }
    if (body.picture !== undefined) {
        updates.push('picture = ?')
        values.push(body.picture)
    }
    if (updates.length === 0)
        return response.status(400).json({ error: 'no valid fields' })
    let conn
    try {
        conn = await db.getConnection()
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        values.push(id)
        const result = await conn.query(sql, values)
        if (result.affectedRows === 0)
            return response.status(404).json({ error: 'user not found' })
        response.json(body)
    } catch (err) {
        console.error('Error updating user', err)
        response.status(500).json({ error: 'db error' })
    } finally {
        if (conn)
            conn.release()
    }
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
