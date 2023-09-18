import { useContext, FC, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CalendarPage, CharacterImportPage, CharactersPage, DMPage, ErrorPage, LandingPage, PlayerPage} from './Pages/Index.ts'
// import { SocketContext } from './socket.ts'
import { supabaseContext } from './supabase.ts';
import { useUser } from '@clerk/clerk-react'

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import './App.css'
import NavBar from './Components/NavBar.tsx'
import { DMSetupPage } from './Pages/DMSetupPage.tsx';
import { PlayerWaitingPage } from './Pages/PlayerWaitingPage.tsx';
import { WaitingPage } from './Pages/WaitingPage.tsx';
import { GamePage } from './Pages/GamePage.tsx';


const App: FC = () => {

  const [theme, setTheme] = useState('TheRoundTable')
  const { user } = useUser();
  // const socket = useContext(SocketContext)
  const supabase = useContext(supabaseContext)

  if (!user) {
    return (
      <div>
        not signed in... what? how???
      </div>
    )
  }


  return (
    // <SocketContext.Provider value={socket}>
      <supabaseContext.Provider value={supabase}>
        <div data-theme={localStorage.getItem('theme') || theme} className='h-screen max-w-screen overflow-x-hidden hiddenScroll'>

          <NavBar setTheme={setTheme}/>

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/import" element={<CharacterImportPage user_id={user.id}/>} />
              <Route path="/characters" element={<CharactersPage user_id={user.id}/>} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/waiting-room/:roomName" element={<WaitingPage user_id={user.id}/>} />
              <Route path="/rooms/:roomName" element={<GamePage user_id={user.id}/>} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </BrowserRouter>

        </div>
      </supabaseContext.Provider>
    // </SocketContext.Provider>
  )
}

export default App

// maybe move the users array thing up a level from player waiting page to waiting page, so the dm also has access to it, just makes sense
// then display the users to the dm and give him the option to remove people that dont belong in the room
// once a room is setup dont allow new people to join unless they are already in the party
// make a character prompt component
// make an editor for the DM screen
// allow the DM to upload files to their bin
// add the bin to the database
// continue development on file bin component
// UPDATE AND FURTHER DEVELOP MODALS
// MORE INTERTWINING OF REAL DATA 
// ALLOW USERS TO EDIT CHARACTERS ONCE THEY ARE UPLOADED
// ALLOW USERS TO DELETE CHARACTERS FROM CHARACTER SHEET

// try to get class / subclass details from dndapi or maybe even manual upload