import { characterDataI } from "../CharacterSheet"
import { HealthBar } from "../HealthBar"


export const Header = ({ characterData, handleSubmit }: { characterData: characterDataI, handleSubmit: () => void }) => {
  return (
    <div className="flex flex-row justify-around bg-yellow-100">
      <div className=" flex flex-col ">
        <div className=" rounded-full flex flex-col justify-center  bg-slate-500 text-center h-24 w-24 font2 capitalize m-1">profile pic</div>
        {/* <button className="btn btn-primary"> edit <br /> character </button> */}
        <button className="btn btn-primary font2 capitalize text-lg m-1 btn-sm" onClick={handleSubmit}>edit</button>
        {/* editing ? cancel : edit charcter */}
        <button className="btn btn-primary font2 capitalize text-lg m-1 btn-sm" onClick={handleSubmit}>Submit</button>
        {/* editing ? save : null */}
      </div>
      <div className="flex flex-col w-1/4 ">
        <div className="flex flex-row justify-center font2 capitalize text-lg" >
          {/* <label> Name: <InputText value={editableCharacterData.name} onChange={(e) => handleInputChange(e, 'name')} /> </label> */}
          <p className="text-3xl"> {characterData.name} </p>
          <p> {characterData.party_id} </p>
        </div>
        <div className="flex flex-row justify-center font2 capitalize text-lg gap-1">
          { }
          {/* <label> Race: <Chips value={editableCharacterData.race} onChange={(e) => handleChipChange(e, 'race')} /> </label> */}
          <p className="p-1"> {characterData.race.map((item, index) => (<p key={index}> {item} </p>))} </p>
          <p className="p-1"> {characterData.background} </p>
          <p className="p-1"> {characterData.alignment} </p>
        </div>
        <div className="flex flex-row justify-center font2 capitalize text-lg gap-1">
          <p className="p-1"> {characterData.class.map((item, index) => (<p key={index}> {item} </p>))} </p>
          <p className="p-1"> {characterData.subclass.map((item, index) => (<p key={index}> {item} </p>))} </p>
          <p className="p-1"> {characterData.level} </p>
        </div>
      </div>
      <div className="flex flex-col font2 capitalize text-lg w-1/4">
        <HealthBar currentHealth={characterData.character_stats.currenthp} maxHealth={characterData.character_stats.maxhp} />
        <div className="flex flex-row justify-center">
          <p> <span className='text-xl font-accent'>status:</span> {characterData.character_stats.status} </p>
        </div>
        <p className="place-self-center font-accent"> death saves </p>
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
      <div className="flex flex-col font2 w-1/4">
        <div className="flex flex-row h-1/2">
          <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
            <p> AC: {characterData.character_stats.ac}</p>
          </div>
          <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
            <p className='capitalize'>speed: {characterData.character_stats.speed}ft</p>
          </div>
        </div>
        <div className="flex flex-row h-1/2">
          <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
            <p className='capitalize'>initiative: <br/>+{characterData.character_stats.initiative}</p>
          </div>
          <div className="flex flex-col w-1/2 p-2 m-1 bg-slate-400 rounded-xl text-center justify-center items-center">
            <p className='capitalize'>proficiency bonus: +{characterData.character_stats.proficiency}</p>
          </div>
        </div>
      </div>
    </div>
  )
}