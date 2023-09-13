import { characterDataI } from '../CharacterSheet'

export const Feats = ({characterData}:{characterData: characterDataI}) => {

  return (
    <div className="flex flex-col flex-wrap h-1/2 bg-yellow-100">
      <p>feats: {characterData.character_stats.feats.map((feat, index) => (<p className="p-1" key={index}>{feat}</p>))}</p>
      <p>class abilities: </p>

    </div>
  )
}