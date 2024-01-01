import React, { useState, useContext, useCallback, useEffect } from 'react'

import { Header, CoreStats, SavingThrows, Skills, LanguageWeapon, Inventory } from './characterSheetComponents/index'
import { SpellSheet } from './SpellSheet'
import { LoadingPage } from '../Pages/LoadingPage'
import { supabaseContext } from '../Utils/supabase'
import { bulkUpdateCharacterData } from '../Utils/SupabaseFns'


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

const CharacterSheetMain = (props :{ characterData: characterDataI, characterIndex:number, onChange:(id: number, newCharData: characterDataI) => void, onDelete: (id: number) => void }, ref: any) => {
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

  const handleInputChange = useCallback((value: any, property1: string, property2:string | undefined) => {
    setEditableCharacterData( (previousData) => {

      const newCharacterData = { ...previousData }
      if (property2 === undefined) {
        newCharacterData[property1] = value
      } else {
        newCharacterData[property1][property2] = value
      }

      return newCharacterData
    })
  }, [])

  const mapCharacterDataToDBSubmission = (characterData: characterDataI) => {
    return {
      character: {
        id: characterData.id,
        creator_id: characterData.creator_id,
        party_id: characterData.party_id,
        name: characterData.name,
        image_url: characterData.image_url,
        race: characterData.race,
        class: characterData.class,
        subclass: characterData.subclass,
        background: characterData.background,
        alignment: characterData.alignment,
        level: characterData.level,
        hitdice: characterData.hitdice,
        languages: characterData.languages,
        locked: characterData.locked,
        proficiencies: characterData.proficiencies,
        class_abilities: characterData.class_abilities
      },
      stats: characterData.character_stats,
      proficiency: characterData.character_proficiency,
      inventory: characterData.character_inventory
    };
  }

  const handleSubmit = async () => {
    const DBsubmission = mapCharacterDataToDBSubmission(editableCharacterData);
    try {
      await bulkUpdateCharacterData(editableCharacterData.id, DBsubmission);  
    } catch (error) {
      console.error(error);
    } finally {
      props.onChange(editableCharacterData.id, editableCharacterData)
      setIsEditing(false);
    }
  };

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
        {
          isLocked 
            ? null 
            : <div>
                <button className={`btn btn-primary font-accent capitalize m-5 ${isDeleting || isDeleted ? 'btn-disabled' : ''}`} onClick={() => { setIsEditing(!isEditing) }}>{isEditing ? 'click to discard changes' : 'Edit Character'}</button>
                {isEditing ? <button className="btn btn-primary font-accent capitalize m-5" onClick={() => setEditableCharacterData(props.characterData)}>Click Me To Reset Values To Default</button> : null}
                {isEditing ? <button className="btn btn-primary font-accent capitalize m-5" onClick={handleSubmit}>Click Me To Save Changes</button> : null}
                <button className={`btn btn-primary font-accent capitalize m-5 ${isEditing || isDeleted ? 'btn-disabled' : ''}`} onClick={() => { setIsDeleting(!isDeleting) }}>{isDeleting ? 'Are You Sure? Click Me To Cancel' : 'Delete Character'}</button>
                {isDeleting ? <button className={`btn btn-primary font-accent capitalize m-5 ${isDeleted ? 'btn-disabled' : ''}`} onClick={handleDelete}>Click Me To Confirm Deletion</button> : null}
              </div> 
        }

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

/**
 * !!make class & subclass specific modules, maybe pop-up modals 
 * 
 * add question marks to everything
 * show how to calculate values for different stat points
 * 
 * make it new player friendly!,
 * explain what dice are used for what
 * add push pull and carry values, = to strength
 */