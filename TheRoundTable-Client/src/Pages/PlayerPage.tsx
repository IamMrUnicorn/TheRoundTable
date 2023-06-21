import { FC, useState, useContext } from "react";
import { LocationInfo, SpotifyMusicPlayer, PartySection } from '../GameComponents/LeftTab/Index'
import { PlayGround, ActionLog, PlayerTools } from '../GameComponents/MiddleTab/index'
import { party, messages, sessionDetails } from '../exampleData'
import NotesContainer from '../GameComponents/RightTab/NotesContainer.js'

import { SocketContext } from "../socket";
import { useUser } from '@clerk/clerk-react'


const GamePage: FC = () => {
  const {user} = useUser()
  const socket = useContext(SocketContext)


  if (!user) {
    return<div>loading...</div>
  }
  return (
    <SocketContext.Provider value={socket}>

      <div className='main-container h-full flex flex-row'>

        <div className='main-LeftTab h-full flex flex-col'>
          <LocationInfo sessionDetails={sessionDetails} />
          <PartySection party={party} />
          <SpotifyMusicPlayer />
        </div>
        <div className='main-CenterTab h-full flex flex-col'>
          <PlayGround />
          <ActionLog Messages={messages} />
          <PlayerTools setPopup={}/>
        </div>

        <div className='main-RightTab h-full flex flex-col'>
          <NotesContainer />
        </div>

      </div>
    </SocketContext.Provider>
  )
}

export default GamePage

// he established core fundamentals about himself in his personal narative


// interview questions
// tell me about yourself
// questions about mvc and mv vm
// what is the dom tree
//   the way the browser interpreits the html file