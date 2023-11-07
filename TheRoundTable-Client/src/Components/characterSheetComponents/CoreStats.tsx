import { characterDataI } from "../CharacterSheet";

const CORE_STATS = [
  { name: 'strength', color: 'bg-red-400' },
  { name: 'dexterity', color: 'bg-orange-400' },
  { name: 'constitution', color: 'bg-yellow-400' },
  { name: 'intelligence', color: 'bg-green-400' },
  { name: 'wisdom', color: 'bg-blue-400' },
  { name: 'charisma', color: 'bg-purple-400' },
];

export interface CharacterSheetComponentI { 
    characterData: characterDataI, 
    isEditing:boolean, 
    onInputChange:(value:any, property1:string, property2?:string, property3?:string)=>void, 
    editableCharacterData: characterDataI
  }
export const CoreStats = ({ characterData, isEditing, onInputChange, editableCharacterData }: CharacterSheetComponentI) => {
  return (
    <div className="flex flex-row font-accent capitalize h-40 ">
      <div className="flex justify-around w-full items-center ">
        {CORE_STATS.map((stat) => (
          <div
            key={stat.name}
            className={`text-center text-lg border border-solid border-black rounded-2xl ${stat.color} w-20 h-20 lg:w-24 lg:h-24 transform rotate-45 relative`}
          >
            <div className="transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <p> {stat.name} </p>
              {isEditing ? <input className='w-2/4 text-center' value={editableCharacterData.character_stats[stat.name]} onChange={(e)=>onInputChange(e.target.value, 'character_stats', stat.name)} type='number' min='0' max='30'/> : <p> {characterData.character_stats[stat.name]} </p>}
            </div>
            <div className="bg-white border border-solid border-black rounded-full transform -rotate-45 h-10 w-10 flex justify-center items-center font-bold absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
              {isEditing ? <p>{Math.floor((editableCharacterData.character_stats[stat.name] - 10) / 2)}</p> : <p> {Math.floor((characterData.character_stats[stat.name] - 10) / 2)} </p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
