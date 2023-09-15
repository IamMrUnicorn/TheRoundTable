import { useState, useEffect, useContext } from "react";
import { CharacterPageProps } from "./CharacterImportPage.js";
import { Player } from "../GameComponents/LeftTab/PlayerCard";
import { LocationInfo, SpotifyMusicPlayer, PartySection } from '../GameComponents/LeftTab/Index'
import { TurnOrder, PlayGround, ActionLog, PlayerTools, PlayerToolsMobile } from '../GameComponents/MiddleTab/index'
import NotesContainer from '../GameComponents/RightTab/NotesContainer'
import { ActionModal, BonusActionModal, RollModal, SpellsModal, TalkModal, WeaponsModal, InventoryModal } from '../GameComponents/Modals/index'
import { CharacterSheet } from "../Components/CharacterSheet";

import { party, messages, sessionDetails } from '../exampleData'


import { supabaseContext } from "../supabase.js";
import { number } from "yup";


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

export interface Character {
  clerk_user_id: string;
  alignment: string;
  background: string;
  character_inventory: {
    character_id: number;
    spells: {
      cantrips: string[];
      lvl1: string[];
      lvl2: string[];
      lvl3: string[];
      lvl4: string[];
      lvl5: string[];
      lvl6: string[];
      lvl7: string[];
      lvl8: string[];
      lvl9: string[];
    };
    weapons: {
      heavy: string[];
      light: string[];
      reach: string[];
      range: string[];
      thrown: string[];
      loading: string[];
      finesse: string[];
      special: string[];
      versatile: string[];
      twoHanded: string[];
      magicalWeapons: string[];
    };
    inventory: {
      copper: number;
      silver: number;
      gold: number;
      platinum: number;
      inventory: string[];
    };
  };
  character_proficiency: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
    athletics: boolean;
    acrobatics: boolean;
    sleightOfHand: boolean;
    intimidation: boolean;
    performance: boolean;
    investigation: boolean;
    animalHandling: boolean;
    nature: boolean;
    religion: boolean;
    history: boolean;
    insight: boolean;
    medicine: boolean;
    perception: boolean;
    survival: boolean;
    deception: boolean;
    stealth: boolean;
    arcana: boolean;
    persuasion: boolean;
  };
  character_stats: {
    ac: number;
    charisma: number;
    constitution: number;
    currenthp: number;
    dexterity: number;
    feats: string[];
    initiative: number
    intelligence: number
    maxhp: number
    proficiency: number
    speed: number
    spell_dc: number
    status: string;
    strength: number;
    wisdom: number
  };
  class: string[];
  hitdice: string;
  id: number;
  image_url: string | null;
  languages: string[];
  level: number;
  name: string;
  proficiencies: string[];
  race: string[];
  subclass: string[];
}


const PlayerPage = ({ user_id }: CharacterPageProps) => {
  const [popup, setPopup] = useState('none')

  const supabase = useContext(supabaseContext)
  const [usersCharacter, setUsersCharacter] = useState<Character | null>(null)
  const [characters, setCharacters] = useState<Character[] | null>(null)
  useEffect(() => {
    const getCharactersFromPartyId = async (partyId: number) => {
      try {
        const { data: Character, error } = await supabase
          .from('characters')
          .select(`
            id,
            clerk_user_id,
            name,
            image_url,
            race,
            class,
            subclass,
            background,
            alignment,
            level,
            hitdice,
            languages,
            proficiencies,
            character_stats:character_stats (
              *
            ),
            character_proficiency:character_proficiency (
              *
            ),
            character_inventory:character_inventory (
              *
            )
          `)
          .eq('party_id', partyId)

        if (error || !Character) throw error;
        const transformedCharacters = await Promise.all(Character.map(async (character: any): Promise<Character> => {

          character.character_stats = character.character_stats[0];
          delete character.character_stats.id;
          delete character.character_stats.character_id;
          delete character.character_proficiency.character_id;

          character.race = JSON.parse(character.race)
          character.class = JSON.parse(character.class)
          character.subclass = JSON.parse(character.subclass)
          character.languages = JSON.parse(character.languages)
          character.proficiencies = JSON.parse(character.proficiencies)
          character.character_stats.feats = JSON.parse(character.character_stats.feats);

          ['spells', 'weapons', 'inventory'].forEach(key => {
            character.character_inventory[key] = JSON.parse(character.character_inventory[key]);
          });

          return character as Character;
        }));

        setCharacters(transformedCharacters);
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    const getRoomIdFromName = async (roomName: string) => {
      try {
        const { data, error } = await supabase
          .from('parties')
          .select('id')
          .eq('name', roomName)
          .single();

        if (error || !data) throw error;

        return data.id;
      } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
      }
    };
    let url = window.location.pathname.slice(7);
    let decodedUrl = decodeURIComponent(url);
    getRoomIdFromName(decodedUrl)
      .then(roomId => {
        getCharactersFromPartyId(roomId);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });

      const findUsersCharacterFromParty = (characters: Character[] | null) => {
        if (!characters) return
        const thisUsersCharacter = characters.filter((character) => (character.clerk_user_id === user_id))
        setUsersCharacter(thisUsersCharacter[0])
      }
      findUsersCharacterFromParty(characters)
  }, [])

  console.log(characters)

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
          <PartySection party={characters} />
          {/* <SpotifyMusicPlayer /> */}
        </div>

        <div className='lg:w-[40%] flex flex-col'>
          {characters?.length === 0 ? null : (<TurnOrder OrderedCharacters={characters} selectedCharacter={usersCharacter} />)}
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

