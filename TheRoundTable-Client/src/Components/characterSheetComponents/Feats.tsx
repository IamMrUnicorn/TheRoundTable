import { characterDataI } from '../CharacterSheet'

export const Feats = ({ characterData }: { characterData: characterDataI }) => {

  return (
    <div className="flex flex-col flex-wrap h-1/2 p-5 bg-yellow-100">
      <p className='font-accent capitalize'>feats:
        {characterData.character_stats.feats.map( (feat, index) => (
          <p className="p-1 font2" key={index}>{feat}</p>
        ))}
      </p>
      <p className='font-accent capitalize'>class abilities: </p>

    </div>
  )
}