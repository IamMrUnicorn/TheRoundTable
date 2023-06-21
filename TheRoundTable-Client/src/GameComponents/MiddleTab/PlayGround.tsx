import {useState, useEffect, FC} from "react";
import TurnOrder from "./TurnOrder";


const PlayGround:FC = () => {

  //axios or socket.io request for data
  const [characters, setCharacters] = useState<string[]>([''])
  const [selectedCharacter, setSelectedCharacter] = useState('')

  useEffect(() => {
    setCharacters(['zaris', 'dragon', 'malarie', 'stigander', 'bojack', 'tanwyn', 'goblin'])
    setSelectedCharacter('stigander')
  }, [])

  return (
    <div className="bg-secondary PlayGround-container flex flex-col">
      {characters.length === 0 ? null :(
        <div className="bg-primary text-neutral self-center text-xl breadcrumbs rounded-md w-full flex justify-center">
          <TurnOrder OrderedCharacters={characters} selectedCharacter={selectedCharacter}/> 
        </div>
      )}
      <div className="PlayGround-map flex flex-row justify-center">
        <img className="w-[400px] h-[400px]" src="https://preview.redd.it/high-quality-elden-ring-map-all-grace-sites-6509x6809-jpg-v0-q6m3ni3st4s81.jpg?auto=webp&s=7fb6eb3e3a1f44e933ae85b6b1d630f3123b6003" />
      </div>
      {/* <div className="PlayGround-camera">
      </div> */}

      {/* reaction pop up */}
    </div>
  )
}

export default PlayGround