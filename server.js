const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: 'c708f2d5e34746498e62d2af34fb1ccc',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')
rollbar.critical('Critcal error message')
app.use(express.json())

const students = ['Jimmy', 'Timothy', 'Jimothy']
app.use(cors())
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.log("Someone requested a student list")
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
           res.status(400).send('You must enter a name.')
           rollbar.log('Please enter a name')
           rollbar.critical('Please enter a name')
       } else if (name === "Nelson") {
            rollbar.warning("Exit log failed: You have entered the Administrator's name")
       } else {
           res.status(400).send('That student already exists.')
           rollbar.critical("Student Already Exists in System Please Try again")
       }
       rollbar.info('Someone added a student')
   } catch (err) {
       console.log(err)
       rollbar.error(`${err} triggered in the post request to /api/stuents`)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
    rollbar.log(`Someone deleted a student`)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
