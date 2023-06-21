
interface TurnOrderProps {
  OrderedCharacters: string[],
  selectedCharacter: string
}
const TurnOrder = ({OrderedCharacters, selectedCharacter}:TurnOrderProps) => {

// add status icons over player on turn order if they're frightended
  return (
    <ol>
      {OrderedCharacters.map((character, index) => {
        if (selectedCharacter === character) {
          return (
            <li key={index}> <i className="fa-solid fa-star"></i> {character}</li>
          )
        } else if (character === 'tanwyn') {
          return (
            <li key={index}> <i className="fa-solid fa-skull"></i> {character}</li>
          )
        } else {
          return (
            <li key={index}>{character}</li>
          )
        }
      })}
    </ol>
  ) 
}

export default TurnOrder