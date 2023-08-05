import { Character } from "../../Pages/PlayerPage"


interface PlayerProps {
  character: Character
}

// player DCs and spell slots, (and character specific things like ki points or sorcery points) inspiration dice, weapon in hand, 
const PlayerCard = ({ character }: PlayerProps) => {
  return (
    <div className="bg-base-100 p-1 m-2 rounded-3xl justify-between flex flex-row">

      <div className="flex flex-col">

        <div className="avatar p-2">
          <div className="w-20 self-center h-20 rounded-full ring ring-primary ring-offset-base-100">
            <img src={character.image_url ? character.image_url : ''}></img>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mx-1 mb-1 flex flex-row">
            <p className="">{character.name}</p>
          </div>
          <div className="mx-1 mb-1 flex flex-row">
            {character.race.map((race, index) => (
              <p key={index}>{race}</p>
            ))}
          </div>
          <div className="mx-1 mb-1 flex flex-row">
            {character.class.map((characterClass, index) => (
              <p className="pr-3" key={index}>{characterClass}</p>
            ))} | {character.level}
          </div>
          <div className="mx-1 mb-1 flex flex-row">
            {character.subclass.map((characterSubClass, index) => (
              <p className="pr-3" key={index}>{characterSubClass}</p>
            ))}
          </div>
          <div className="mx-1 mb-1 flex flex-row" >
            <p className="">{character.character_stats.status}</p>
          </div>
        </div>

      </div>

      <div className="flex flex-col 2xl:flex-row  m-1 ">

        <div className="flex flex-col items-end m-1">
          <p className="">HP: {character.character_stats.currenthp}/{character.character_stats.maxhp} <i className="fa-solid fa-briefcase-medical"></i></p>
          <p>AC: {character.character_stats.ac} <i className="fa-solid fa-shield-halved"></i></p>
          <p>speed: {character.character_stats.speed} <i className="fa-solid fa-person-skating"></i></p>
          <p>proficiency:+{character.character_stats.proficiency} </p>
        </div>

        <div className="flex flex-col items-end m-1">
          <p>str: {character.character_stats.strength} <i className="fa-solid fa-hand-fist"></i></p>
          <p>dex: {character.character_stats.dexterity} <i className="fa-solid fa-feather-pointed"></i></p>
          <p>con: {character.character_stats.constitution} <i className="fa-solid fa-heart-pulse"></i></p>
          <p>int: {character.character_stats.intelligence} <i className="fa-solid fa-glasses"></i></p>
          <p>wis: {character.character_stats.wisdom} <i className="fa-solid fa-hat-wizard"></i></p>
          <p>cha: {character.character_stats.charisma} <i className="fa-solid fa-masks-theater"></i></p>
        </div>
      </div>

    </div>
  )
}

export default PlayerCard