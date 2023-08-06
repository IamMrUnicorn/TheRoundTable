
import { PlayerCard } from "./Index";
import { Character } from "../../Pages/PlayerPage";

interface PartyProps {
  party: Character[] | null
}

//todo add a sort option, sort by current hp, maxhp, class, name(alphabetical), level(default), status
const PartySection = ({party}:PartyProps) => {

  if (!party) return null

  return (
    <div className="bg-primary max-h-[20vh] lg:max-h-[53vh] flex flex-col hiddenScroll">
      {party?.map((character:Character, index) => (
        <PlayerCard key={index} character={character}/>
      ))}
    </div>
  )
}

export default PartySection