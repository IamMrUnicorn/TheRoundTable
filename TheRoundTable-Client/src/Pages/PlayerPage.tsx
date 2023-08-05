import { FC, useState, useEffect } from "react";
import { LocationInfo, SpotifyMusicPlayer, PartySection } from '../GameComponents/LeftTab/Index'
import { TurnOrder, PlayGround, ActionLog, PlayerTools, PlayerToolsMobile } from '../GameComponents/MiddleTab/index'
import { party, messages, sessionDetails } from '../exampleData'
import { ActionModal, BonusActionModal, RollModal, SpellsModal, TalkModal, WeaponsModal, InventoryModal } from '../GameComponents/Modals/index'
import NotesContainer from '../GameComponents/RightTab/NotesContainer.js'

import { useUser } from '@clerk/clerk-react'
import { Player } from "../GameComponents/LeftTab/PlayerCard.js";


const PlayerPage: FC = () => {
  const { user } = useUser()
  const [popup, setPopup] = useState('none')
  const Stigander = party[0];
  const [characters, setCharacters] = useState<Player[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Player>(characters[0])
  useEffect(() => {
    setCharacters(party)
    setSelectedCharacter(Stigander)
  }, [])

  if (!user) {
    return <div>loading...</div>
  }

  return (
    <>
      <div className='hidden lg:w-full lg:max-h-[95vh] lg:flex lg:flex-row'>

        {popup === 'action' ? <ActionModal setPopup={setPopup} />
          : popup === 'bonus action' ? <BonusActionModal setPopup={setPopup} />
            : popup === 'spells' ? <SpellsModal setPopup={setPopup} CharacterSpells={Stigander.spells} />
              : popup === 'weapons' ? <WeaponsModal setPopup={setPopup} CharacterWeapons={Stigander.weapons} />
              : popup === 'inventory' ? <InventoryModal setPopup={setPopup} CharacterInventory={Stigander.inventory} />
              : popup === 'talk' ? <TalkModal setPopup={setPopup} />
              : popup === 'roll' ? <RollModal setPopup={setPopup} />
              : null}

        <div className='lg:w-[30%] flex flex-col'>
          <LocationInfo sessionDetails={sessionDetails} />
          <PartySection party={party} />
          <SpotifyMusicPlayer />
        </div>

        <div className='lg:w-[40%] flex flex-col'>
          {characters.length === 0 ? null : (<TurnOrder OrderedCharacters={characters} selectedCharacter={selectedCharacter} />)}
          <PlayGround />
          <ActionLog Messages={messages} />
          <PlayerTools setPopup={setPopup} />
        </div>

        <div className='lg:w-[30%] flex flex-col'>
          <NotesContainer />
        </div>

      </div>


      {/* smaller than laptop view (mobile & tablets) */}
      <div className='flex flex-col lg:hidden'>

        {popup === 'action' ? <ActionModal setPopup={setPopup} />
          : popup === 'bonus action' ? <BonusActionModal setPopup={setPopup} />
          : popup === 'spells' ? <SpellsModal setPopup={setPopup} CharacterSpells={Stigander.spells} />
          : popup === 'weapons' ? <WeaponsModal setPopup={setPopup} CharacterWeapons={Stigander.weapons} />
          : popup === 'inventory' ? <InventoryModal setPopup={setPopup} CharacterInventory={Stigander.inventory} />
          : popup === 'talk' ? <TalkModal setPopup={setPopup} />
          : popup === 'roll' ? <RollModal setPopup={setPopup} />
          : null}


          {characters.length === 0 ? null : (
            <TurnOrder OrderedCharacters={characters} selectedCharacter={selectedCharacter} />
            )}
          <LocationInfo sessionDetails={sessionDetails} />
        <PlayGround />
        <ActionLog Messages={messages} />

        <div className='flex flex-row'>
          <PlayerToolsMobile setPopup={setPopup} />
          <PartySection party={party} />
        </div>


        {/* <div className='flex '>
          <NotesContainer />
        </div> */}

      </div>
    </>
  )
}

export default PlayerPage

