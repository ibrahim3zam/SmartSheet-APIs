import express from 'express'
import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve('./config/.env') })

const app = express()
const port = process.env.PORT

import { connectDB } from './DB/connection.js'
import * as allRouters from './Src/Modules/index.routers.js'


connectDB()
app.use(express.json())

app.use('/uploads', express.static('./uploads'))
app.use('/trello/user', allRouters.userRouters)
app.use('/trello/task', allRouters.taskRouters)

app.get('/', (req, res) => res.send('Hello There! , welcone in Trello App'))
app.all('*', (req, res) => { res.status(404).json({ Message: "404 Not fount URL" }) })

app.use((err, req, res, next) => {
    if (err) {
        res.status(err['cause'] || 500).json({ message: err.message })
    }
})

app.listen(port, () => { console.log(`...Server is running on Port ${port}`); })