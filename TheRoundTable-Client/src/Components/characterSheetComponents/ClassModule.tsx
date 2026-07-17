import { CharacterSheetComponentI } from './CoreStats'



export const ClassModule = ({ characterData, editableCharacterData, isEditing, onInputChange }: CharacterSheetComponentI) => {
  return (
    <div className="flex flex-row h-1/6 py-5 bg-neutral">
      
      
    </div>
  )
}



{/* <div className="flex flex-col font-accent capitalize px-10 pt-2 gap-2">
        <p className='font-primary text-xl'> Languages: </p>
        {isEditing
          ? <Chips value={editableCharacterData.languages} onChange={(e) => onInputChange(e.value || [], 'languages')} itemTemplate={customChip} pt={{ inputToken: { className: 'text-black bg-white p-1' }, container: { className: 'flex flex-col' } }} />
          : characterData.languages.map((language, index) => (
            <p className="font-accent pl-5" key={index}> {language} </p>
          ))
        }
      </div>
      <div className="flex flex-col font-accent capitalize px-10 pt-2 gap-2">
        <p className='font-primary text-xl'>Proficiencies:</p>
        {isEditing
          ? <Chips value={editableCharacterData.proficiencies} onChange={(e) => onInputChange(e.value || [], 'proficiencies')} itemTemplate={customChip} pt={{ inputToken: { className: 'text-black bg-white p-1' }, container: { className: 'flex flex-col' } }} />
          : characterData.proficiencies.map((proficiency, index) => (
            <p className="font-accent pl-5" key={index}> {proficiency} </p>
          ))
        }
      </div> */}