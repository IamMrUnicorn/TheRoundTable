import { FC } from "react"


export interface Player {
  user: string,
  avatar: string,
  name: string,
  race: string,
  class: string,
  level: string,
  subClass: string,
  status: string,
  currHP: number,
  maxHP: number,
  AC: number,
  speed: number,
  proficiency: number
  strength: number,
  dexterity: number,
  consitution: number,
  intelligence: number,
  wisdom: number,
  charisma: number,
}
interface PlayerProps {
  player: Player
}

// player DCs and spell slots, (and character specific things like ki points or sorcery points) inspiration dice, weapon in hand, 
const PlayerCard:FC<PlayerProps> = ({ player }) => {
  return (
    <div className="bg-base-100 p-1 m-2 rounded-3xl justify-between flex flex-row">

      <div className="flex flex-row bg-black">

        <div className="avatar p-2 bg-white">
          <div className="w-20 self-center h-20 rounded-full ring ring-primary ring-offset-base-100">
            <img src={player.avatar}></img>
          </div>
        </div>

        <div className="flex flex-col bg-slate-600">
          <div className="m-1 flex flex-row">
            <p className="Party-Player-name">{player.race}</p>
          </div>
          <div className="m-1 flex flex-row">
            <p className="Party-Player-class">{player.class} | lvl{player.level}</p>
          </div>
          <div className="m-1 flex flex-row">
            <p className=" Party-Player-subclass">{player.subClass}</p>
          </div>
          <div className="m-1 flex flex-row" >
            <p className="Party-Player-status">{player.status}</p>
          </div>
        </div>

      </div>

      <div className="flex lg:flex-col 2xl:flex-row  m-1 bg-yellow-500">

        <div className="flex flex-col items-end m-1 bg-blue-500">
          <p className="Party-Player-HP">HP: {player.currHP}/{player.maxHP} <i className="fa-solid fa-briefcase-medical"></i></p>
          <p>AC: {player.AC} <i className="fa-solid fa-shield-halved"></i></p>
          <p>speed: {player.speed} <i className="fa-solid fa-person-skating"></i></p>
          <p>Proficiency: {player.proficiency} <i className="fa-solid fa-square-plus"></i></p>
        </div>

        <div className="flex flex-col items-end m-1 bg-red-400">
          <p>str: {player.strength} <i className="fa-solid fa-hand-fist"></i></p>
          <p>dex: {player.dexterity} <i className="fa-solid fa-feather-pointed"></i></p>
          <p>con: {player.consitution} <i className="fa-solid fa-heart-pulse"></i></p>
          <p>int: {player.intelligence} <i className="fa-solid fa-glasses"></i></p>
          <p>wis: {player.wisdom} <i className="fa-solid fa-hat-wizard"></i></p>
          <p>cha: {player.charisma} <i className="fa-solid fa-masks-theater"></i></p>
        </div>
      </div>

    </div>
  )
}

export default PlayerCard