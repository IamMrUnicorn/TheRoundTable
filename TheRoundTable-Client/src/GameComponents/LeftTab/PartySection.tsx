import {useState, useEffect} from "react";

import { PlayerCard } from "./Index";
import { PlayerProps } from "./PlayerCard";

interface PartyProps {
  party: [PlayerProps]
}

//todo add a sort option, sort by current hp, maxhp, class, name(alphabetical), level(default), status
const PartySection = ({party}:PartyProps) => {


  return (
    <div className="bg-primary max-h-[600px] overflow-y-scroll flex flex-col">
      {party.map((player, index) => (
        <PlayerCard key={index} player={player}/>
      ))}
    </div>
  )
}

export default PartySection