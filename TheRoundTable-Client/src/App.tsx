import { useContext, FC, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CalendarPage, CharacterImportPage, CharactersPage, DMPage, ErrorPage, LandingPage, PlayerPage, RoomPage} from './Pages/Index.ts'
import { SocketContext } from './socket.ts'
import { useUser } from '@clerk/clerk-react'

import './App.css'
import NavBar from './Components/NavBar.tsx'


const App: FC = () => {

  const [theme, setTheme] = useState('coffee')
  const { user } = useUser();
  const socket = useContext(SocketContext)


  if (!user) {
    return (
      <div>
        not signed in... what? how???
      </div>
    )
  }

  return (
    <SocketContext.Provider value={socket}>
      <div data-theme={localStorage.getItem('theme') || theme} className='max-h-screen max-w-screen'>

        <NavBar avatar={user.profileImageUrl} setTheme={setTheme}/>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/import" element={<CharacterImportPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/rooms" element={<RoomPage />} />
            <Route path="/rooms/:roomID" element={user.publicMetadata.isDM ? <DMPage /> : <PlayerPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>

      </div>
    </SocketContext.Provider>
  )
}

export default App
