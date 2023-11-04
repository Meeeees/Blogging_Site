const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const AuthController = require('./Controllers/AuthController.js');
const ContentController = require('./Controllers/ContentController.js');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pfp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.get('/', (req, res) => {
    res.send('Hello, the frontend is hosted on port 3000')
})

app.get('/auth/checkMail', (req, res) => AuthController.checkMail(req.query.email, res))


app.post('/auth/register', upload.single('pfp'), (req, res) => {
    let pfp_url
    if (req.file == undefined) {
        pfp_url = null
    } else {
        pfp_url = req.file.path
        pfp_url = pfp_url.replace('uploads', '')
    }
    AuthController.createUser(req.body.username, req.body.email, req.body.password, req.body.description, pfp_url).then((result) => {
        console.log('createuser: ', result)
        res.status(200).json(result)
    })
})

app.get('/auth/verify', (req, res) => {
    AuthController.verify(req.query.key, res)
})

app.post('/auth/login', (req, res) => {
    AuthController.loginUser(req.body.username, req.body.password, res)
})


app.get('/content/posts/:id', async (req, res) => {
    let data = await ContentController.GetPostsOfUser(req.params.id)
    console.log('dat', data)
    res.status(200).json(data)
})

app.listen(8080, () => {
    console.log('Listening on port 8080');
})
