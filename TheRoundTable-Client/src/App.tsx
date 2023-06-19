import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext, FC } from 'react'
import { SocketContext } from './socket.ts'
import { UserProfile, useUser } from '@clerk/clerk-react'

import './App.css'
import NavBar from './Components/NavBar.tsx'
import LandingPage from "./Pages/LandingPage.tsx";
import ErrorPage from "./Pages/ErrorPage.tsx";
import AccountPage from "./Pages/AccountPage.tsx";
import CharacterImportPage from "./Pages/CharacterImportPage.tsx";
import CharactersPage from "./Pages/CharactersPage.tsx";
import CalendarPage from "./Pages/CalendarPage.tsx";
import RoomPage from "./Pages/RoomPage.tsx";

const App: FC = () => {

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
      <div data-theme={localStorage.getItem('theme') || 'coffee'} className='h-screen w-screen overflow-scroll'>

        <NavBar avatar={user.profileImageUrl} />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/import" element={<CharacterImportPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/account" element={<AccountPage clerkProfile={UserProfile}/>} />
            <Route path="/room/:roomID" element={<RoomPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>

      </div>
    </SocketContext.Provider>
  )
}

export default App
