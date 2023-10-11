import { characterDataI } from '../CharacterSheet'

export const Feats = ({ characterData }: { characterData: characterDataI }) => {

  return (
    <div className="flex flex-col flex-wrap h-1/2 p-5 bg-yellow-100">
      <div className='font-primary capitalize'>feats:
        {characterData.character_stats.feats.map( (feat, index) => (
          <p className="p-1 font-accent" key={index}>{feat}</p>
        ))}
      </div>
      <p className='font-primary capitalize'>class abilities: </p>

    </div>
  )
}