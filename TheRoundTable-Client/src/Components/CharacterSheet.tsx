import { Chips } from 'primereact/chips'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { useState } from 'react'

import { Header, CoreStats, SavingThrows, Skills, LanguageWeapon, Inventory } from './characterSheetComponents/index'
import { SpellSheet } from './SpellSheet'
import { LoadingPage } from '../Pages/LoadingPage'


export interface characterDataI {
  party_id: string | null,
  name: string,
  image_url: string | null,
  race: string[],
  class: string[],
  subclass: string[],
  background: string,
  alignment: string,
  level: number,
  hitdice: string,
  languages: string[],
  proficiencies: string[],
  character_stats: {
    status: string,
    currenthp: number,
    maxhp: number,
    ac: number,
    proficiency: number,
    initiative: number,
    speed: number,
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number,
    spell_dc: number,
    feats: string[]
  },
  character_proficiency: {
    strength: boolean,
    dexterity: boolean,
    constitution: boolean,
    intelligence: boolean,
    wisdom: boolean,
    charisma: boolean,
    athletics: boolean,
    acrobatics: boolean,
    sleightofhand: boolean,
    stealth: boolean,
    arcana: boolean,
    history: boolean,
    investigation: boolean,
    nature: boolean,
    religion: boolean,
    animalhandling: boolean,
    insight: boolean,
    medicine: boolean,
    perception: boolean,
    survival: boolean,
    deception: boolean,
    intimidation: boolean,
    performance: boolean,
    persuasion: boolean
  },
  character_inventory: {
    character_id: 9,
    spells: {
      cantrips: string[],
      lvl1: string[],
      lvl2: string[],
      lvl3: string[],
      lvl4: string[],
      lvl5: string[],
      lvl6: string[],
      lvl7: string[],
      lvl8: string[],
      lvl9: string[]
    },
    weapons: {
      heavy: string[],
      light: string[],
      reach: string[],
      range: string[],
      thrown: string[],
      loading: string[],
      finesse: string[],
      special: string[],
      versatile: string[],
      twoHanded: string[],
      magicalWeapons: string[]
    },
    inventory: {
      copper: number,
      silver: number,
      gold: number,
      platinum: number,
      inventory: string[]
    }
  }
}


export const CharacterSheet = ({ characterData }: { characterData: characterDataI }) => {

  const [isFlipped, setIsFlipped] = useState(false);
  const [isHidden, setIsHidden] = useState(false)

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setIsHidden(!isHidden)
    }, 500);
  };

  const [editableCharacterData, setEditableCharacterData] = useState(characterData)

  const handleInputChange = (e: any, property: string) => {
    const newCharacterData = { ...editableCharacterData }
    newCharacterData[property] = e.target.value
    setEditableCharacterData(newCharacterData)
  }

  const handleChipChange = (e: any, property: string) => {
    const newCharacterData = { ...editableCharacterData }
    newCharacterData[property] = e.value
    setEditableCharacterData(newCharacterData)
  }

  const handleSubmit = () => {
    console.log(editableCharacterData)
  }

  console.log(characterData)
  if (characterData === undefined ) {
    return <LoadingPage/>
  }
  return (
    <div className="rounded">

      <div className={`${isHidden ? 'hidden' : ''} rounded text-black ${isFlipped ? 'z-10' : 'z-20'}`} style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        transition: 'all 0.5s ease-in-out',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        <button className="btn btn-primary font-accent capitalize m-5" onClick={toggleFlip}>Flip For Spell Sheet</button>

        <div className="flex flex-col p-8 bg-yellow-100 rounded-3xl ">
          <Header characterData={characterData} handleSubmit={handleSubmit} />
          <CoreStats characterData={characterData} />
          <div className="flex flex-row h-min ">
            <div className="flex flex-col w-1/2">
              <SavingThrows characterData={characterData} />
              <Skills characterData={characterData} />
            </div>
            <LanguageWeapon characterData={characterData} />
          </div>
          <Inventory characterData={characterData} />
        </div>
      </div>

      <div className={`${isHidden ? '' : 'hidden'} ${isFlipped ? 'z-30' : 'z-10'}`} style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        transition: 'all 0.5s ease-in-out',
        transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)'
      }}>
        <button className="btn btn-primary font-accent capitalize m-5" onClick={toggleFlip}>Flip Back For Character Sheet</button>
        <SpellSheet spells={characterData.character_inventory.spells}/>
      </div>
    </div>
  )
}

