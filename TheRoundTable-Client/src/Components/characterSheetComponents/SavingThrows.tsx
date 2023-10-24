import { characterDataI } from "../CharacterSheet";
import { CharacterSheetComponentI } from "./CoreStats";
import { InfoBlock } from "./Header";

const SAVING_THROWS = [
  { name: 'strength', color: 'bg-red-400' },
  { name: 'dexterity', color: 'bg-orange-400' },
  { name: 'constitution', color: 'bg-yellow-400' },
  { name: 'intelligence', color: 'bg-green-400' },
  { name: 'wisdom', color: 'bg-blue-400' },
  { name: 'charisma', color: 'bg-purple-400' },
];

  


export const SavingThrows = ({ characterData, isEditing, onInputChange, editableCharacterData }: CharacterSheetComponentI) => {
  return (
    <div className="flex flex-row font-accent capitalize ">
      <div className="flex flex-col w-1/2 ">
        <p className="text-center text-2xl font-primary capitalize p-1"> saving throws </p>
        
        {isEditing 
        ? SAVING_THROWS.map((stat) => (
          <div onClick={()=>onInputChange(!editableCharacterData.character_proficiency[stat.name], 'character_proficiency', stat.name)} key={stat.name} className={`flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black ${stat.color}`}>
            <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${editableCharacterData.character_proficiency[stat.name] ? 'bg-black text-white' : 'bg-white text-black'}`}>
              {Math.floor((editableCharacterData.character_stats[stat.name] - 10) / 2) + (editableCharacterData.character_proficiency[stat.name] ? editableCharacterData.character_stats.proficiency : 0)}
            </div>
            <p className="text-lg"> {stat.name} </p>
          </div>
        )) 
        : SAVING_THROWS.map((stat) => (
          <div key={stat.name} className={`flex flex-row rounded-full w-3/4 place-self-center border border-solid border-black ${stat.color}`}>
            <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${characterData.character_proficiency[stat.name] ? 'bg-black text-white' : 'bg-white text-black'}`}>
              {Math.floor((characterData.character_stats[stat.name] - 10) / 2) + (characterData.character_proficiency[stat.name] ? characterData.character_stats.proficiency : 0)}
            </div>
            <p className="text-lg"> {stat.name} </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 text-xl w-1/2 ">
        <InfoBlock label='hit dice' content={characterData.hitdice} isEditing={isEditing} onInputChange={onInputChange} property1='hitdice' editableContent={editableCharacterData.hitdice} />
        <InfoBlock label='passive perception' content={10 + Math.floor((characterData.character_stats['wisdom'] - 10) / 2) + (characterData.character_proficiency.perception ? characterData.character_stats.proficiency : 0)} />
        <InfoBlock label='spell cast ability' content={characterData.character_stats.spellcast_ability} isEditing={isEditing} onInputChange={onInputChange} property1='character_stats' property2='spellcast_ability' editableContent={editableCharacterData.character_stats.spellcast_ability} />
        <div className='flex flex-row mx-auto gap-5'>
          <InfoBlock label='spell DC' content={8 + characterData.character_stats.proficiency + (characterData.character_stats.spellcast_ability ? Math.floor((characterData.character_stats[characterData.character_stats.spellcast_ability] - 10) / 2) : 0)} />
          <InfoBlock label='spell attack mod' content={characterData.character_stats.proficiency + (characterData.character_stats.spellcast_ability ? Math.floor((characterData.character_stats[characterData.character_stats.spellcast_ability] - 10) / 2) : 0)} />
        </div>
      </div>
    </div>
  );
};
