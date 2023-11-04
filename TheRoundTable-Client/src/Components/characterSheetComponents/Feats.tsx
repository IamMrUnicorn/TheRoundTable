import { CharacterSheetComponentI } from './CoreStats'

export const Feats = ({ characterData, editableCharacterData, isEditing, onInputChange }: CharacterSheetComponentI) => {


  return (
    <div className="flex flex-col flex-wrap h-1/2 p-5 ">
      <div className='font-primary capitalize '>
        <p className='text-xl'>feats:</p>
        {isEditing 
        ? <div>
            <button onClick={()=>onInputChange([...editableCharacterData.character_stats.feats, ])} className='btn btn-primary'>Add a new Feat</button>
          </div>
        : characterData.character_stats.feats.map( (feat, index) => (
          <div>
            <p className="p-1 font-accent" key={index}>{feat.title}</p>
            <p className="p-1 font-accent" key={index}>{feat.description}</p>
          </div>
          ))
        }
      </div>
      <p className='font-primary text-xl capitalize'>class abilities: </p>

    </div>
  )
}
// add buttons to add new feat / class ability
// when button is clicked, generate a new blank "card" with a title and description
// add delete button on cards
