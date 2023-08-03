import { useContext, FC, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CalendarPage, CharacterImportPage, CharactersPage, DMPage, ErrorPage, LandingPage, PlayerPage} from './Pages/Index.ts'
import { SocketContext } from './socket.ts'
import { supabaseContext } from './supabase.ts';
import { useUser } from '@clerk/clerk-react'

import './App.css'
import NavBar from './Components/NavBar.tsx'


const App: FC = () => {

  const [theme, setTheme] = useState('TheRoundTable')
  const { user } = useUser();
  const socket = useContext(SocketContext)
  const supabase = useContext(supabaseContext)

  if (!user) {
    return (
      <div>
        not signed in... what? how???
      </div>
    )
  }


  /**
   * main monitor: 1920x937 2xl
   * second monitor 1360x625 xl
   * my macbook air: 1366x657 full screen, hidden menu bar. 1366x605 with menu bar
   * john's macbook: 1280x720 xl
   * shuhua monitor: 1731x980 2xl
   * 
   */
  return (
    <SocketContext.Provider value={socket}>
      <supabaseContext.Provider value={supabase}>
        <div data-theme={localStorage.getItem('theme') || theme} className='h-screen max-w-screen overflow-x-hidden hiddenScroll '>

          <NavBar setTheme={setTheme}/>

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/import" element={<CharacterImportPage username={user.username} user_id={user.id}/>} />
              <Route path="/characters" element={<CharactersPage username={user.username} />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/rooms/:roomID" element={!user.publicMetadata.isDM ? <DMPage /> : <PlayerPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </BrowserRouter>

        </div>
      </supabaseContext.Provider>
    </SocketContext.Provider>
  )
}

export default App
