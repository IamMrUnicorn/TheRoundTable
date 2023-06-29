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
  // TODO work with the data
  res.json('got your character, working on adding to database')
})


// {
//   name: 'a',
//   race: 'a',
//   class: 'a',
//   subclass: 'a',
//   level: 0,
//   background: 'a',
//   alignment: 'lawful good ',
//   hitDice: 'a',
//   maxHP: 0,
//   AC: 0,
//   proficiency: 0,
//   initiative: 0,
//   speed: 0,
//   strength: 0,
//   dexterity: 0,
//   constitution: 0,
//   intelligence: 0,
//   wisdom: 0,
//   charisma: 0,
//   spellDC: 0,
//   feats: [],
//   strengthProficient: false,
//   dexterityProficient: false,
//   constitutionProficient: false,
//   intelligenceProficient: false,
//   wisdomProficient: false,
//   charismaProficient: false,
//   athleticsProficient: false,
//   acrobaticsProficient: false,
//   sleightOfHandProficient: false,
//   intimidationProficient: false,
//   performanceProficient: false,
//   investigationProficient: false,
//   animalHandlingProficient: false,
//   natureProficient: false,
//   religionProficient: false,
//   historyProficient: false,
//   insightProficient: false,
//   medicineProficient: false,
//   perceptionProficient: false,
//   survivalProficient: false,
//   deceptionProficient: false,
//   stealthProficient: false,
//   arcanaProficient: false,
//   persuasionProficient: false,
//   copper: 0,
//   silver: 0,
//   gold: 0,
//   platinum: 0,
//   inventory: [],
//   cantrips: [],
//   lvl1: [],
//   lvl2: [],
//   lvl3: [],
//   lvl4: [],
//   lvl5: [],
//   lvl6: [],
//   lvl7: [],
//   lvl8: [],
//   lvl9: [],
//   heavy: [],
//   light: [],
//   reach: [],
//   range: [],
//   thrown: [],
//   loading: [],
//   finesse: [],
//   special: [],
//   versatile: [],
//   twoHanded: [],
//   magicalWeapons: []
// }
io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('test', 'hello?');
})

server.listen(3000, () => {
  console.log(`Server is running on`, server.address());
});