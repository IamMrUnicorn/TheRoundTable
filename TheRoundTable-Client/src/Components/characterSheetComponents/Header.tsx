import { characterDataI } from "../CharacterSheet"
import { HealthBar } from "../HealthBar"


export const Header = ({characterData, handleSubmit}: {characterData: characterDataI, handleSubmit:()=>void}) => {
  return (
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
  )
}