import { HealthBar } from "./HealthBar"
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Chips } from 'primereact/chips'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { useState } from 'react'


interface prop {
  characterData: {
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
}


export const CharacterSheet = ({ characterData }: prop) => {
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
          <div className="flex flex-row justify-around bg-red-100">
            <div className=" flex flex-col ">
              <div className=" rounded-full flex flex-col justify-center  bg-slate-500 text-center h-24 w-24 m-1">profile pic</div>
              {/* <button className="btn btn-primary"> edit <br /> character </button> */}
              <button className="btn btn-primary btn-xs" onClick={handleSubmit}>edit</button>
              {/* editing ? cancel : edit charcter */}
              <button className="btn btn-primary btn-xs" onClick={handleSubmit}>Submit</button>
              {/* editing ? save : null */}
            </div>
            <div className="flex flex-col w-1/4 ">
              <div className="flex flex-row justify-center">
                {/* <label> Name: <InputText value={editableCharacterData.name} onChange={(e) => handleInputChange(e, 'name')} /> </label> */}
                <p className="text-3xl"> {characterData.name} </p>
                {characterData.party_id}
              </div>
              <div className="flex flex-row justify-center gap-1">
                { }
                {/* <label> Race: <Chips value={editableCharacterData.race} onChange={(e) => handleChipChange(e, 'race')} /> </label> */}
                <p className="p-1"> {characterData.race.map((item, index) => (<p key={index}> {item} </p>))} </p>
                <p className="p-1"> {characterData.background} </p>
                <p className="p-1"> {characterData.alignment} </p>
              </div>
              <div className="flex flex-row justify-center gap-1">
                <p className="p-1"> {characterData.class.map((item, index) => (<p key={index}> {item} </p>))} </p>
                <p className="p-1"> {characterData.subclass.map((item, index) => (<p key={index}> {item} </p>))} </p>
                <p className="p-1"> {characterData.level} </p>
              </div>
            </div>
            <div className="flex flex-col w-1/4">
              <HealthBar currentHealth={characterData.character_stats.currenthp} maxHealth={characterData.character_stats.maxhp} />
              <div className="flex flex-row justify-center">
                status: {characterData.character_stats.status}
              </div>
              <p className="place-self-center"> death saves </p>
              <div className="flex flex-row gap-3 justify-center">
                <input type="checkbox" />
                <input type="checkbox" />
                <input type="checkbox" />
                <p className="place-self-center "> success </p>
              </div>
              <div className="flex flex-row gap-3 justify-center">
                <input type="checkbox" />
                <input type="checkbox" />
                <input type="checkbox" />
                <p className="place-self-center "> failures </p>
              </div>
            </div>
            <div className="flex flex-col w-1/4">
              <div className="flex flex-row h-1/2">
                <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
                  AC: {characterData.character_stats.ac}
                </div>
                <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
                  speed: {characterData.character_stats.speed}ft
                </div>
              </div>
              <div className="flex flex-row h-1/2">
                <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
                  initiative: +{characterData.character_stats.initiative}
                </div>
                <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
                  proficiency bonus: +{characterData.character_stats.proficiency}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row  h-40 bg-yellow-100">
            <div className="flex justify-around w-full items-center ">
              <div className="text-center border border-solid border-black rounded-2xl bg-red-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  strength <br />
                  {characterData.character_stats.strength}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.strength - 10) / 2)}
                </div>
              </div>
              <div className="text-center border border-solid border-black rounded-2xl bg-orange-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  dexterity <br />
                  {characterData.character_stats.dexterity}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.dexterity - 10) / 2)}
                </div>
              </div>
              <div className="text-center border border-solid border-black rounded-2xl bg-yellow-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  constitution <br />
                  {characterData.character_stats.constitution}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.constitution - 10) / 2)}
                </div>
              </div>
              <div className="text-center border border-solid border-black rounded-2xl bg-green-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  intelligence <br />
                  {characterData.character_stats.intelligence}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.intelligence - 10) / 2)}
                </div>
              </div>
              <div className="text-center border border-solid border-black rounded-2xl bg-blue-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  wisdom <br />
                  {characterData.character_stats.wisdom}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.wisdom - 10) / 2)}
                </div>
              </div>
              <div className="text-center border border-solid border-black rounded-2xl bg-purple-400 w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative">
                <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  charisma <br />
                  {characterData.character_stats.charisma}
                </div>
                <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  +{Math.floor((characterData.character_stats.charisma - 10) / 2)}
                </div>
              </div>
            </div>
          </div>
        <div className="flex flex-row ">
          <div className="flex flex-col w-1/2">
            <div className="flex flex-row bg-yellow-100">
              <div className="flex flex-col w-1/2 ">
                <p className="text-center text-xl"> saving throws </p>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-red-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.strength ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.strength - 10) / 2) + (characterData.character_proficiency.strength ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> strength </p>
                </div>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-orange-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.dexterity ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.dexterity - 10) / 2) + (characterData.character_proficiency.dexterity ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> dexterity </p>
                </div>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-yellow-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.constitution ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.constitution - 10) / 2) + (characterData.character_proficiency.constitution ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> constitution </p>
                </div>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.intelligence ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.intelligence ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> intelligence </p>
                </div>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.wisdom ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.wisdom ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> wisdom </p>
                </div>
                <div className="flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black bg-purple-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.charisma ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.charisma - 10) / 2) + (characterData.character_proficiency.charisma ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> charisma </p>
                </div>
              </div>
              <div className="flex flex-col  w-1/2 ">
                <div className=" self-center p-2">hit dice: {characterData.hitdice}</div>
                <div className=" self-center p-2">passive perception: </div>
                <div className=" self-center p-2">spell cast ability ____ </div>
                <div className=" self-center p-2">spell DC: {characterData.character_stats.spell_dc}  |  spell atk +__</div>
                <div className=" btn " onClick={() => { console.log('dog') }}>flip page over for spell sheet</div>
              </div>
            </div>
            <div className="flex flex-col flex-wrap h-1/2 pt-3 bg-yellow-100">
              <p className=" place-self-end text-lg">skills</p>
              <div className="flex flex-col ">
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-red-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.athletics ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.strength - 10) / 2) + (characterData.character_proficiency.athletics ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> athletics </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-orange-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.acrobatics ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.dexterity - 10) / 2) + (characterData.character_proficiency.acrobatics ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> acrobatics </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-orange-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.sleightofhand ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.dexterity - 10) / 2) + (characterData.character_proficiency.sleightofhand ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-sm md:text-md place-self-center"> sleight of hand </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-orange-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.stealth ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.stealth ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> stealth </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.arcana ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.arcana ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> arcana </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.history ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.history ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> history </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.investigation ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.investigation ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-md lg:text-lg"> investigation </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.nature ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.nature ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> nature </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-green-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.religion ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.intelligence - 10) / 2) + (characterData.character_proficiency.religion ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> religion </p>
                </div>
              </div>
              <div className="flex flex-col pt-7">
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-purple-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.deception ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.charisma - 10) / 2) + (characterData.character_proficiency.deception ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> deception </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-purple-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.intimidation ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.charisma - 10) / 2) + (characterData.character_proficiency.intimidation ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> intimidation </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-purple-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.performance ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.charisma - 10) / 2) + (characterData.character_proficiency.performance ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> performance </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-purple-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.persuasion ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.charisma - 10) / 2) + (characterData.character_proficiency.persuasion ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> persuasion </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.animalhandling ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.animalhandling ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-sm md:text-md place-self-center"> animal handling </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.insight ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.insight ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> insight </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.medicine ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.medicine ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> medicine </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.perception ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.perception ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> perception </p>
                </div>
                <div className="flex flex-row rounded-full w-4/5 place-self-center border border-solid border-black bg-blue-400">
                  <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency.survival ? 'bg-black text-white' : 'bg-white text-black'}`}> +{Math.floor((characterData.character_stats.wisdom - 10) / 2) + (characterData.character_proficiency.survival ? characterData.character_stats.proficiency : 0)}</div>
                  <p className="text-lg"> survival </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col  p-5 bg-yellow-100">
            <div className="flex flex-row gap-2">
              languages:
              {characterData.languages.map((language, index) => (
                <p className="" key={index}> {language} </p>
              ))}
            </div>
            <div className="flex flex-row gap-2">
              proficiencies:
              {characterData.proficiencies.map((proficiency, index) => (
                <p key={index}>{proficiency}</p>
              ))}
            </div>
            <Accordion>
            {Object.entries(characterData.character_inventory.weapons).map(([type, weapons], index) => (
              <AccordionTab key={index} contentClassName="bg-red-300" header={type}>
                {weapons.length ? (
                  weapons.map((weapon, weaponIndex) => (
                    <p className="flex flex-row" key={weaponIndex}>{weapon}</p>
                  ))
                ) : (
                  <p>empty</p>
                )}
              </AccordionTab>
            ))}
          </Accordion>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full ">
        <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll bg-yellow-100">
          <div className=''>
            <div className='flex flex-row'>
              <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-orange-400'>Copper <br/> {characterData.character_inventory.inventory.copper}</p>
              <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-slate-400'>Silver <br/> {characterData.character_inventory.inventory.silver}</p>
              <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-yellow-400'>Gold <br/> {characterData.character_inventory.inventory.gold}</p>
              <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-slate-200'>Platinum <br/> {characterData.character_inventory.inventory.platinum}</p>
            </div>
            <h4>Items:</h4>
            {characterData.character_inventory.inventory.inventory.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-wrap h-1/2 bg-yellow-100">
          <p>feats: {characterData.character_stats.feats.map((feat, index) => (<p className="p-1" key={index}>{feat}</p>))}</p>
          <p>class abilities: </p>

        </div>
      </div>
    </div>   
  )
}


