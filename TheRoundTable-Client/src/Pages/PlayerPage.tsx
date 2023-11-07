import { useState } from "react";
import { LocationInfo, PartySection } from '../GameComponents/LeftTab/Index'
import { TurnOrder, PlayGround, ActionLog, PlayerTools, PlayerToolsMobile } from '../GameComponents/MiddleTab/index'
import NotesContainer from '../GameComponents/RightTab/NotesContainer'
import { ActionModal, BonusActionModal, RollModal, SpellsModal, TalkModal, WeaponsModal, InventoryModal } from '../GameComponents/Modals/index'

import { party, messages, sessionDetails } from '../exampleData'

import { characterDataI } from "../Components/CharacterSheet";

// make the player section on the left like a collapsable side tab
/**
 * 
 * first check if the room is setup, if no display a waiting room
 * then check if the current user has a character in the party, if no then have them select one
 * once all players in the party have selected a character, set players as ready and display waiting for DM
 * Once DM claim's their position, allow them to setup the room however they may need.
 *   dm checklist
 *    connect to spotify
 *    upload map
 *    upload story
 *    "get the discord ready"
 *    
 */



const PlayerPage = ({ party, usersCharacter  }: {party: characterDataI[] | undefined, usersCharacter: characterDataI | undefined}) => {
  const [popup, setPopup] = useState('none')



  return (
    <>
      <div className='hidden lg:w-full lg:max-h-[95vh] lg:flex lg:flex-row'>

        {popup === 'action' ? <ActionModal setPopup={setPopup} />
          : popup === 'bonus action' ? <BonusActionModal setPopup={setPopup} />
            : popup === 'spells' ? <SpellsModal setPopup={setPopup} CharacterSpells={usersCharacter?.character_inventory.spells} />
              : popup === 'weapons' ? <WeaponsModal setPopup={setPopup} CharacterWeapons={usersCharacter?.character_inventory.weapons} />
                : popup === 'inventory' ? <InventoryModal setPopup={setPopup} CharacterInventory={usersCharacter?.character_inventory.inventory} />
                  : popup === 'talk' ? <TalkModal setPopup={setPopup} />
                    : popup === 'roll' ? <RollModal setPopup={setPopup} />
                      : null}

        <div className='lg:w-[30%] flex flex-col'>
          <LocationInfo sessionDetails={sessionDetails} />
          <PartySection party={party} DMview={false} />
        </div>

        <div className='lg:w-[40%] flex flex-col'>
          {party?.length === 0 ? null : (<TurnOrder OrderedCharacters={party} selectedCharacter={usersCharacter} />)}
          <PlayGround />
          <ActionLog Messages={messages} />
          <PlayerTools setPopup={setPopup} />
        </div>

        <div className='lg:w-[30%] flex flex-col'>
          <NotesContainer />
        </div>

      </div>


      {/* smaller than laptop view (mobile & tablets) */}
      {/* <div className='flex flex-col lg:hidden'>

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

      {/* </div> */}
    </>
  )
}

export default PlayerPage

