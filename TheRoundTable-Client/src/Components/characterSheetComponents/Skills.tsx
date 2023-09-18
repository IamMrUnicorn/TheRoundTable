import { characterDataI } from "../CharacterSheet"


const SkillItem = ({ proficiency, value, label, stat, bgColor }: { proficiency: boolean, value: number, label: string, stat: number, bgColor: string }) => (
  <div className={`flex flex-row rounded-full w-full place-self-center border border-solid  border-black ${bgColor}`}>
    <div className={`h-8 w-8 rounded-full text-center pt-1 justify-start mr-4 ${proficiency ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {Math.floor((stat - 10) / 2) + (proficiency ? value : 0)}
    </div>
    <p className="text-lg"> {label} </p>
  </div>
);

export const Skills = ({characterData}:{characterData:characterDataI}) => {
  return (
    <div className="grid grid-cols-2 gap-4  pt-3 font-accent capitalize bg-yellow-100">
      <p className="col-span-2 place-self-center text-3xl font-primary capitalize">skills</p>
      <div className="flex flex-col p-3">
        <SkillItem proficiency={characterData.character_proficiency.athletics} value={characterData.character_stats.proficiency} label="athletics" stat={characterData.character_stats.strength} bgColor='bg-red-400'/>
        <SkillItem proficiency={characterData.character_proficiency.acrobatics} value={characterData.character_stats.proficiency} label="acrobatics" stat={characterData.character_stats.dexterity} bgColor='bg-orange-400'/>
        <SkillItem proficiency={characterData.character_proficiency.sleightofhand} value={characterData.character_stats.proficiency} label="sleightofhand" stat={characterData.character_stats.dexterity} bgColor='bg-orange-400'/>
        <SkillItem proficiency={characterData.character_proficiency.stealth} value={characterData.character_stats.proficiency} label="stealth" stat={characterData.character_stats.dexterity} bgColor='bg-orange-400'/>
        <SkillItem proficiency={characterData.character_proficiency.arcana} value={characterData.character_stats.proficiency} label="arcana" stat={characterData.character_stats.intelligence} bgColor='bg-green-400'/>
        <SkillItem proficiency={characterData.character_proficiency.history} value={characterData.character_stats.proficiency} label="history" stat={characterData.character_stats.intelligence} bgColor='bg-green-400'/>
        <SkillItem proficiency={characterData.character_proficiency.investigation} value={characterData.character_stats.proficiency} label="investigation" stat={characterData.character_stats.intelligence} bgColor='bg-green-400'/>
        <SkillItem proficiency={characterData.character_proficiency.nature} value={characterData.character_stats.proficiency} label="nature" stat={characterData.character_stats.intelligence} bgColor='bg-green-400'/>
        <SkillItem proficiency={characterData.character_proficiency.religion} value={characterData.character_stats.proficiency} label="religion" stat={characterData.character_stats.intelligence} bgColor='bg-green-400'/>
      </div>
      <div className="flex flex-col p-3">
        <SkillItem proficiency={characterData.character_proficiency.deception} value={characterData.character_stats.proficiency} label="deception" stat={characterData.character_stats.charisma} bgColor='bg-purple-400'/>
        <SkillItem proficiency={characterData.character_proficiency.intimidation} value={characterData.character_stats.proficiency} label="intimidation" stat={characterData.character_stats.charisma} bgColor='bg-purple-400'/>
        <SkillItem proficiency={characterData.character_proficiency.performance} value={characterData.character_stats.proficiency} label="performance" stat={characterData.character_stats.charisma} bgColor='bg-purple-400'/>
        <SkillItem proficiency={characterData.character_proficiency.persuasion} value={characterData.character_stats.proficiency} label="persuasion" stat={characterData.character_stats.charisma} bgColor='bg-purple-400'/>
        <SkillItem proficiency={characterData.character_proficiency.animalhandling} value={characterData.character_stats.proficiency} label="animalhandling" stat={characterData.character_stats.wisdom} bgColor='bg-blue-400'/>
        <SkillItem proficiency={characterData.character_proficiency.insight} value={characterData.character_stats.proficiency} label="insight" stat={characterData.character_stats.wisdom} bgColor='bg-blue-400'/>
        <SkillItem proficiency={characterData.character_proficiency.medicine} value={characterData.character_stats.proficiency} label="medicine" stat={characterData.character_stats.wisdom} bgColor='bg-blue-400'/>
        <SkillItem proficiency={characterData.character_proficiency.perception} value={characterData.character_stats.proficiency} label="perception" stat={characterData.character_stats.wisdom} bgColor='bg-blue-400'/>
        <SkillItem proficiency={characterData.character_proficiency.survival} value={characterData.character_stats.proficiency} label="survival" stat={characterData.character_stats.wisdom} bgColor='bg-blue-400'/>
      </div>
    </div>
  )
}
