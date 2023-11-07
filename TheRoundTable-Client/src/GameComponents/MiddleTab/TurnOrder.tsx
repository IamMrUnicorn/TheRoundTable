import { characterDataI } from "../../Components/CharacterSheet"

interface TurnOrderProps {
  OrderedCharacters: characterDataI[] | undefined,
  selectedCharacter?: characterDataI | null
}
const TurnOrder = ({OrderedCharacters, selectedCharacter}:TurnOrderProps) => {

  if (!OrderedCharacters) return
// add status icons over player on turn order if they're frightended
  return (
    <ol className="flex flex-row rounded-md min-h-[24px] gap-1 bg-primary text-neutral hiddenScroll font10 px-1 ">
      {OrderedCharacters.map((character, index) => {
        if (selectedCharacter === character) {
          return (
            <li className="flex flex-row" key={index}> <i className="fa-solid fa-star"/> {character.name}</li>
          )
        } else if (character.character_stats.status === 'dead') {
          return (
            <li className="flex flex-row" key={index}> <i className="fa-solid fa-skull"/> {character.name}</li>
          )
        } else {
          return (
            <li className="flex flex-row" key={index}>{character.name}</li>
          )
        }
      })}
    </ol>
  ) 
}

export default TurnOrder