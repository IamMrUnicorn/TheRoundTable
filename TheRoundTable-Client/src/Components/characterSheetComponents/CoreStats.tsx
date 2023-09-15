import { characterDataI } from "../CharacterSheet"

export const CoreStats = ({characterData}:{characterData:characterDataI}) => {

  return (
    <div className="flex flex-row font2 capitalize h-40 bg-yellow-100">
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
  )
}