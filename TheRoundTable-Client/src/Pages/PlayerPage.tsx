import { FC, useState, useContext } from "react";
import { LocationInfo, SpotifyMusicPlayer, PartySection } from '../GameComponents/LeftTab/Index'
import { PlayGround, ActionLog, PlayerTools } from '../GameComponents/MiddleTab/index'
import { party, messages, sessionDetails } from '../exampleData'
import { ActionModal, BonusActionModal, RollModal, SpellsModal, TalkModal } from '../GameComponents/Modals/index'
import NotesContainer from '../GameComponents/RightTab/NotesContainer.js'

import { SocketContext } from "../socket";
import { useUser } from '@clerk/clerk-react'


const GamePage: FC = () => {
  const {user} = useUser()
  const socket = useContext(SocketContext)
  const [popup, setPopup] = useState('none')
  
  if (!user) {
    return<div>loading...</div>
  }
  return (
    <SocketContext.Provider value={socket}>

      <div className='w-full overflow-hidden flex flex-row'>

      {popup === 'action' ? <ActionModal setPopup={setPopup}/>
      : popup === 'bonus action' ? <BonusActionModal setPopup={setPopup} />
      : popup === 'spells' ? <SpellsModal setPopup={setPopup} />
      : popup === 'weapons' ? <WeaponsModal setPopup={setPopup} />
      : popup === 'inventory' ? <InventoryModal setPopup={setPopup} />
      : popup === 'talk' ? <TalkModal setPopup={setPopup} />
      : popup === 'roll' ? <RollModal setPopup={setPopup} />
      : null}


        <div className='w-[33.3%] flex flex-col'>
          <LocationInfo sessionDetails={sessionDetails} />
          <PartySection party={party} />
          <SpotifyMusicPlayer />
        </div>

        <div className='w-[33.3%] flex flex-col'>
          <PlayGround />
          <ActionLog Messages={messages} />
          <PlayerTools setPopup={setPopup}/>
        </div>

        <div className='w-[33.3%] flex flex-col'>
          <NotesContainer />
        </div>

      </div>
    </SocketContext.Provider>
  )
}

export default GamePage

