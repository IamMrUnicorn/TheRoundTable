import { Accordion, AccordionTab } from 'primereact/accordion'
import { CharacterSheetComponentI } from './CoreStats'
import { Chips } from "primereact/chips";
import { customChip } from "./Inventory";

export const LanguageWeapon = ({ characterData, editableCharacterData, isEditing, onInputChange }: CharacterSheetComponentI) => {
  return (
    <div className="flex flex-col w-1/2 px-5 bg-neutral">
      <div className='flex flex-row'>

        <div className="flex flex-col font-accent capitalize px-10 pt-2 gap-2">
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
        </div>
      </div>
      <p className='font-primary p-1  ml-10 text-xl'>Weapons:</p>
      <Accordion className='pl-5 ml-10'>
        {
          Object.entries(characterData.character_inventory)
            .filter(([key]) => key.endsWith('W'))
            .map(([type, weapons], index) => {
              const weaponList = weapons as string[];
              return (
                <AccordionTab key={index} className='font-primary capitalize py-1 my-1' header={type.replace('W', '')}>
                  {weaponList.length ? (
                    isEditing
                      ? <Chips value={editableCharacterData.character_inventory[type]} onChange={(e) => onInputChange(e.value || [], 'character_inventory', type)} itemTemplate={customChip} pt={{ inputToken: { className: 'text-black bg-white p-1' }, container: { className: 'flex flex-row-reverse' } }} />
                      : weaponList.map((weapon, weaponIndex) => (
                        <p className="font-accent pl-5" key={weaponIndex}> {weapon} </p>
                      ))
                  ) : (
                    isEditing
                      ? <Chips value={editableCharacterData.character_inventory[type]} onChange={(e) => onInputChange(e.value || [], 'character_inventory', type)} itemTemplate={customChip} pt={{ inputToken: { className: 'text-black bg-white p-1' }, container: { className: 'flex flex-row-reverse' } }} />
                      : <p className='bg-red-300 p-1 pl-3 font-accent rounded-lg capitalize'>empty</p>
                  )}
                </AccordionTab>
              )
            })
        }
      </Accordion>
    </div>
  )
}