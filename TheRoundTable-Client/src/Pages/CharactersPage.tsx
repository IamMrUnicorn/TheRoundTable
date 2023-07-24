import { useEffect } from "react";
import axios from 'axios'

interface CharacterPageProps {
  username: string;
}
const CharactersPage = ({username}:CharacterPageProps) => {

  useEffect(() => {
    axios.get(`http://localhost:5173/characters/${username}`)
    .then((res)=>{})
  }, [])
  return (
    <div>

      Characters page
    </div>
  )
}

export default CharactersPage

//show all of the users characters