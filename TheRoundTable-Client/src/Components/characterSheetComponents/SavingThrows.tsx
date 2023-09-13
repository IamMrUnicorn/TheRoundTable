import { characterDataI } from "../CharacterSheet"

export const SavingThrows = ({characterData}: {characterData:characterDataI}) => {

  return (
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
  )
}