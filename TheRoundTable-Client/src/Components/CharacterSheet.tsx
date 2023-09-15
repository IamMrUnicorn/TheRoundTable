import { Accordion, AccordionTab } from 'primereact/accordion'
import { Chips } from 'primereact/chips'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { useState } from 'react'

import {Header, CoreStats, SavingThrows, Skills, LanguageWeapon, Inventory, Feats} from './characterSheetComponents/index'


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


export const CharacterSheet = ({ characterData }: {characterData: characterDataI}) => {
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
  return (
    <div className="flex flex-row text-black ">
      <div className="flex flex-col">
        <Header characterData={characterData} handleSubmit={handleSubmit}/>
        <CoreStats characterData={characterData}/>
        <div className="flex flex-row ">
          <div className="flex flex-col w-1/2">
            <SavingThrows characterData={characterData}/>
            <Skills characterData={characterData}/>
          </div>
          <LanguageWeapon characterData={characterData}/>
        </div>
      </div>
      <div className="hidden md:flex md:flex-col md:w-full ">
        <Inventory characterData={characterData}/>
        <Feats characterData={characterData}/>
      </div>
    </div>   
  )
}


