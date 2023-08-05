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
        <div data-theme={localStorage.getItem('theme') || theme} className='h-screen max-w-screen overflow-x-hidden hiddenScroll '>

          <NavBar setTheme={setTheme}/>

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/import" element={<CharacterImportPage user_id={user.id}/>} />
              <Route path="/characters" element={<CharactersPage user_id={user.id}/>} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/rooms/:roomID" element={!user.publicMetadata.isDM ? <DMPage /> : <PlayerPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </BrowserRouter>

        </div>
      </supabaseContext.Provider>
    // </SocketContext.Provider>
  )
}

export default App
