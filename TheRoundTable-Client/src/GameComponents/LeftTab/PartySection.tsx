import {useState, useEffect} from "react";

import { PlayerCard } from "./Index";
import { Player } from "./PlayerCard";

interface PartyProps {
  party: Player []
}

//todo add a sort option, sort by current hp, maxhp, class, name(alphabetical), level(default), status
const PartySection = ({party}:PartyProps) => {


  return (
    <div className="bg-primary max-h-[550px] overflow-y-scroll flex flex-col">
      {party.map((player:Player, index) => (
        <PlayerCard key={index} player={player}/>
      ))}
    </div>
  )
}

export default PartySection