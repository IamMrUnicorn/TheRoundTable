const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const http = require('http')
const { Clerk } = require('@clerk/clerk-sdk-node');
const { Server } = require('socket.io')
const { Pool } = require('pg');


const clerk = new Clerk({
  apiKey: process.env.CLERK_API_KEY,
});

const pool = new Pool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: 'theroundtable',
});

const app = express()
const server = http.createServer(app)
dotenv.config();

const io = new Server(server, {cors: {origin: '*'}})


app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(logger(':method :url :status - :response-time ms'))

// app.use(express.static(path.join(__dirname, '../TheRoundTable-Client/dist')))
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../TheRoundTable-Client/dist/index.html'))
// })

app.get('/characters/:username', (req, res) => {
  const username = req.params.username;
  client
    .query(`SELECT *
      FROM users
      JOIN characters ON users.id = characters.user_id
      JOIN character_stats ON characters.id = character_stats.character_id
      JOIN character_proficiency ON characters.id = character_proficiency.character_id
      JOIN character_inventory ON characters.id = character_inventory.character_id
      WHERE users.username = $1;`, [username])
    .then((dbResponse) => {
      res.json(dbResponse.rows);
    })
    .catch((error) => {
      console.error('Failed to fetch data from the database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/characters/:username/import', (req, res) => {
  console.log(req.body)
  res.json('got your character, working on adding to database')
})



io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('test', 'hello?');
})

server.listen(port, ip, () => {
  console.log(`Server is running on`, server.address());
});