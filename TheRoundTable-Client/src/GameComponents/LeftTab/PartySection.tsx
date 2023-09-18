
import { PlayerCard } from "./Index";
import { Character } from "../../Pages/GamePage";

interface PartyProps {
  party: Character[] | null
  DMview: boolean
}

//todo add a sort option, sort by current hp, maxhp, class, name(alphabetical), level(default), status
const PartySection = ({party, DMview}:PartyProps) => {

  if (!party || party.length === 0) return (
    <div className='bg-primary h-full flex flex-row justify-center pt-10'>
      no one's showed up yet :(
    </div>
  )

  if (DMview === true) return (
    <div className="bg-primary h-3/4 rounded-lg m-3 flex flex-col hiddenScroll">
      {party?.map((character:Character, index) => (
        <PlayerCard key={index} character={character} info='max'/>
      ))}
    </div>
  )
  return (
    <div className="bg-primary h-2/3 flex flex-col hiddenScroll">
      {party?.map((character:Character, index) => (
        <PlayerCard key={index} character={character} info='min'/>
      ))}
    </div>
  )
}

export default PartySection