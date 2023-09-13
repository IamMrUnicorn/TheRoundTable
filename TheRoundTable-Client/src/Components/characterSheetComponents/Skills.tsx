import { characterDataI } from "../CharacterSheet"

export const Skills = ({characterData}:{characterData:characterDataI}) => {

  return (
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
  )
}