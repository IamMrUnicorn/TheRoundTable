import React, { useState, useContext, useCallback, useEffect } from 'react'

import { Header, CoreStats, SavingThrows, Skills, LanguageWeapon, Inventory } from './characterSheetComponents/index'
import { SpellSheet } from './SpellSheet'
import { LoadingPage } from '../Pages/LoadingPage'
import { supabaseContext } from '../Utils/supabase'


export interface characterDataI {
  id: number,
  creator_id:number,
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
  class_abilities: string[] | null,
  locked: boolean,
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
    spellcast_ability: string,
    feats: {title: string, description:string}[],
    class_abilities: {title: string, description:string}[],
    [key: string]: string[] | number | string | {title: string, description:string}[];
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
    [key: string]: boolean;
  },
  character_inventory: {
    character_id: number,
    cantrips: string[],
    lvl1: string[],
    lvl2: string[],
    lvl3: string[],
    lvl4: string[],
    lvl5: string[],
    lvl6: string[],
    lvl7: string[],
    lvl8: string[],
    lvl9: string[],
    heavyW: string[],
    lightW: string[],
    reachW: string[],
    rangedW: string[],
    thrownW: string[],
    loadingW: string[],
    finesseW: string[],
    specialW: string[],
    versatileW: string[],
    twohandedW: string[],
    magicalW: string[],
    copper: number,
    silver: number,
    gold: number,
    platinum: number,
    stash: string[]
    [key: string]: string[] | number;
  }
  [key: string]: any
}

const CharacterSheetMain = (props :{ characterData: characterDataI, onDelete: (id: number) => void }, ref: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [isLocked, setIsLocked] = useState(props.characterData.locked)
  const [editableCharacterData, setEditableCharacterData] = useState(props.characterData)
  
  const supabase = useContext(supabaseContext)


  useEffect(() => {
    const updateLockStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('characters')
          .update({ locked: isLocked })
          .eq('id', props.characterData.id)
          .select();
        if (error) throw error;
        // Handle the successful response if needed
      } catch (error) {
        console.error(error);
      }
    };
  
    updateLockStatus();
  }, [isLocked]);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setIsHidden(!isHidden)
    }, 500);
  };


  const handleInputChange = useCallback((value: any, property1: string, property2:String | undefined) => {
    const newCharacterData = { ...editableCharacterData }
    if (property2 === undefined) {
      newCharacterData[property1] = value
    } else {
      newCharacterData[property1][property2] = value
    }
    setEditableCharacterData(newCharacterData)
  }, [])

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
    setIsDeleted(!isDeleted)
    const characterId = props.characterData.id;

    try {
      await deleteFromTable('character_inventory', 'character_id', characterId);
      await deleteFromTable('character_notes', 'character_id', characterId);
      await deleteFromTable('character_proficiency', 'character_id', characterId);
      await deleteFromTable('character_stats', 'character_id', characterId);

      // Finally, delete the character
      await deleteFromTable('characters', 'id', characterId);
      setTimeout(()=> {
        props.onDelete(characterId);
      }, 5000)
    } catch (error) {
      console.log(error);
    }
  };



  if (props.characterData === undefined) {
    return <LoadingPage />
  }
  return (
    <div ref={ref} className="rounded">

      <div className={`${isHidden ? 'hidden' : ''} rounded text-black ${isFlipped ? 'z-10' : 'z-20'}`} style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        transition: 'all 0.5s ease-in-out',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        <button className={`btn btn-primary font-accent capitalize m-5 ${isDeleting || isEditing || isDeleted ? 'btn-disabled' : ''}`} onClick={toggleFlip}>Flip For Spell Sheet</button>
        <button className='btn btn-primary font-accent capitalize m-5' onClick={()=> setIsLocked(!isLocked)}>{ isLocked ? 'Unlock Character Sheet' : 'Lock Character Sheet'}</button>
        {isLocked ? null : <div>
          <button className={`btn btn-primary font-accent capitalize m-5 ${isDeleting || isDeleted ? 'btn-disabled' : ''}`} onClick={() => { setIsEditing(!isEditing) }}>{isEditing ? 'click to discard changes' : 'Edit Character'}</button>
          {isEditing ? <button className="btn btn-primary font-accent capitalize m-5" onClick={() => setEditableCharacterData(props.characterData)}>Click Me To Reset Values To Default</button> : null}
          {isEditing ? <button className="btn btn-primary font-accent capitalize m-5" onClick={() => console.log('save')}>Click Me To Save Changes</button> : null}
          <button className={`btn btn-primary font-accent capitalize m-5 ${isEditing || isDeleted ? 'btn-disabled' : ''}`} onClick={() => { setIsDeleting(!isDeleting) }}>{isDeleting ? 'Are You Sure? Click Me To Cancel' : 'Delete Character'}</button>
          {isDeleting ? <button className={`btn btn-primary font-accent capitalize m-5 ${isDeleted ? 'btn-disabled' : ''}`} onClick={handleDelete}>Click Me To Confirm Deletion</button> : null}
        </div> }

        <div className="flex flex-col p-8 bg-neutral rounded-3xl ">
          <Header characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData} />
          <CoreStats characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData} />
          <div className="flex flex-row h-min ">
            <div className="flex flex-col w-1/2">
              <SavingThrows characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData}/>
              <Skills characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData}/>
            </div>
            <LanguageWeapon characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData}/>
          </div>
          <p className='mx-auto p-3 font-primary text-3xl'>Inventory</p>
          <Inventory characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData}/>
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
        <SpellSheet characterData={props.characterData} isEditing={isEditing} onInputChange={handleInputChange} editableCharacterData={editableCharacterData}/>
      </div>
    </div>
  )
}

export const CharacterSheet = React.memo(React.forwardRef(CharacterSheetMain));

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

/**
 * make class & subclass specific modules, maybe pop-up modals 
 * 
 * 
 * make it new player friendly!,
 * show how to calculate values for different stat points
 * explain what dice are used for what
 * add question marks to everything
 * add push pull and carry values, = to strength
 */