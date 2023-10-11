import { Chips } from 'primereact/chips'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { useState, useContext } from 'react'

import { Header, CoreStats, SavingThrows, Skills, LanguageWeapon, Inventory } from './characterSheetComponents/index'
import { SpellSheet } from './SpellSheet'
import { LoadingPage } from '../Pages/LoadingPage'
import { supabaseContext } from '../supabase'


export interface characterDataI {
  id: number
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


export const CharacterSheet = ({ characterData, onDelete }: { characterData: characterDataI, onDelete: (id: number) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isEditing, setIsEditing] = useState(false)
  const [editableCharacterData, setEditableCharacterData] = useState(characterData)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = useContext(supabaseContext)

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setIsHidden(!isHidden)
    }, 500);
  };


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

  const deleteFromTable = async (tableName: string, colName: string, characterId: number) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(colName, characterId);

    if (error) {
      throw new Error(`Error deleting from ${tableName}: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    const characterId = characterData.id;

    try {
      await deleteFromTable('character_inventory', 'character_id', characterId);
      await deleteFromTable('character_notes', 'character_id', characterId);
      await deleteFromTable('character_proficiency', 'character_id', characterId);
      await deleteFromTable('character_stats', 'character_id', characterId);

      // Finally, delete the character
      await deleteFromTable('characters', 'id', characterId);
      onDelete(characterId);
    } catch (error) {
      console.log(error);
    }
  };




  if (characterData === undefined) {
    return <LoadingPage />
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
        <button className="btn btn-primary font-accent capitalize m-5" onClick={() => { setIsEditing(!isEditing) }}>{isEditing ? 'click to discard changes' : 'Edit Character'}</button>
        {isEditing ? <button className="btn btn-primary font-accent capitalize m-5" onClick={()=>console.log('save')}>Click Me To Save Changes</button> : null}
        <button className="btn btn-primary font-accent capitalize m-5" onClick={() => { setIsDeleting(!isDeleting) }}>{isDeleting ? 'Are You Sure? Click Me To Cancel' : 'Delete Character'}</button>
        {isDeleting ? <button className="btn btn-primary font-accent capitalize m-5" onClick={handleDelete}>Click Me To Confirm Deletion</button> : null}

        <div className="flex flex-col p-8 bg-yellow-100 rounded-3xl ">
          <Header characterData={characterData} isEditing={isEditing} onInputChange={handleInputChange} onChipChange={handleChipChange} />
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
        <button className="btn btn-primary font-accent capitalize ml-44 m-5" onClick={toggleFlip}>Flip Back For Character Sheet</button>
        <button className="btn btn-primary font-accent capitalize m-5" onClick={() => { console.log('edit') }}>Edit</button>
        <SpellSheet spells={characterData.character_inventory.spells} />
      </div>
    </div>
  )
}


/*
const handleSave = async () => {
  const inventory = JSON.stringify({
    copper: editableCharacterData.character_inventory.inventory.copper,
    silver: editableCharacterData.character_inventory.inventory.silver,
    gold: editableCharacterData.character_inventory.inventory.gold,
    platinum: editableCharacterData.character_inventory.inventory.platinum,
    inventory: editableCharacterData.character_inventory.inventory.inventory
  })
  const spells = JSON.stringify({
    cantrips: editableCharacterData.character_inventory.spells.cantrips,
    lvl1: editableCharacterData.character_inventory.spells.lvl1,
    lvl2: editableCharacterData.character_inventory.spells.lvl2,
    lvl3: editableCharacterData.character_inventory.spells.lvl3,
    lvl4: editableCharacterData.character_inventory.spells.lvl4,
    lvl5: editableCharacterData.character_inventory.spells.lvl5,
    lvl6: editableCharacterData.character_inventory.spells.lvl6,
    lvl7: editableCharacterData.character_inventory.spells.lvl7,
    lvl8: editableCharacterData.character_inventory.spells.lvl8,
    lvl9: editableCharacterData.character_inventory.spells.lvl9,
  })
  const weapons = JSON.stringify({
    heavy: editableCharacterData.character_inventory.weapons.heavy,
    light: editableCharacterData.character_inventory.weapons.light,
    reach: editableCharacterData.character_inventory.weapons.reach,
    range: editableCharacterData.character_inventory.weapons.range,
    thrown: editableCharacterData.character_inventory.weapons.thrown,
    loading: editableCharacterData.character_inventory.weapons.loading,
    finesse: editableCharacterData.character_inventory.weapons.finesse,
    special: editableCharacterData.character_inventory.weapons.special,
    versatile: editableCharacterData.character_inventory.weapons.versatile,
    twoHanded: editableCharacterData.character_inventory.weapons.twoHanded,
    magicalWeapons: editableCharacterData.character_inventory.weapons.magicalWeapons
  })

  const DBsubmission = {
    'character': {
      clerk_user_id: user_id,
      party_id: null,
      name: formData.name,
      image_url: null,
      race: JSON.stringify(formData.race),
      class: JSON.stringify(formData.class),
      subclass: JSON.stringify(formData.subclass),
      background: formData.background,
      alignment: formData.alignment,
      level: formData.level,
      hitdice: formData.hitDice,
      languages: JSON.stringify(formData.languages),
      proficiencies: JSON.stringify(formData.proficiencies)
    },
    'stats': {
      character_id: '',
      status: 'healthy',
      currenthp: formData.maxHP,
      maxhp: formData.maxHP,
      ac: formData.AC,
      proficiency: formData.proficiency,
      initiative: formData.initiative,
      speed: formData.speed,
      strength: formData.strength,
      dexterity: formData.dexterity,
      constitution: formData.constitution,
      intelligence: formData.intelligence,
      wisdom: formData.wisdom,
      charisma: formData.charisma,
      spell_dc: formData.spellDC,
      feats: JSON.stringify(formData.feats),
    },
    'proficiency': {
      character_id: '',
      strength: formData.strengthProficient,
      dexterity: formData.dexterityProficient,
      constitution: formData.constitutionProficient,
      intelligence: formData.intelligenceProficient,
      wisdom: formData.wisdomProficient,
      charisma: formData.charismaProficient,
      athletics: formData.athleticsProficient,
      acrobatics: formData.acrobaticsProficient,
      sleightofhand: formData.sleightOfHandProficient,
      stealth: formData.stealthProficient,
      arcana: formData.arcanaProficient,
      history: formData.historyProficient,
      investigation: formData.investigationProficient,
      nature: formData.natureProficient,
      religion: formData.religionProficient,
      animalhandling: formData.animalHandlingProficient,
      insight: formData.insightProficient,
      medicine: formData.medicineProficient,
      perception: formData.perceptionProficient,
      survival: formData.survivalProficient,
      deception: formData.deceptionProficient,
      intimidation: formData.intimidationProficient,
      performance: formData.performanceProficient,
      persuasion: formData.persuasionProficient,
    },
    'inventory': {
      character_id: '',
      spells: spells,
      weapons: weapons,
      inventory: inventory
    },
  }
  const character = JSON.stringify(DBsubmission)

  localStorage.setItem('Main_character', character)

  console.log(DBsubmission.character)
  const { data, error } = await supabase
    .from('characters')
    .insert(DBsubmission.character)
    .select();
  if (error) {
    console.log(error)
  } else {
    console.log(data[0])
    const characterId = data[0].id;
    DBsubmission.stats.character_id = characterId;
    DBsubmission.proficiency.character_id = characterId;
    DBsubmission.inventory.character_id = characterId;
    const { error } = await supabase
      .from('character_stats')
      .insert(DBsubmission.stats);
    if (error) {
      console.log(error)
    } else {
      const { error } = await supabase
        .from('character_proficiency')
        .insert(DBsubmission.proficiency);
      if (error) {
        console.log(error)
      } else {
        const { error } = await supabase
          .from('character_inventory')
          .insert(DBsubmission.inventory)
        if (error) {
          console.log(error)
        } else {
          window.location.href = '/characters'
        }
      }
    }
  }
}; */