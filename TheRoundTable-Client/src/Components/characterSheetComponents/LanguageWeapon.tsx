import { Accordion, AccordionTab } from 'primereact/accordion'
import { characterDataI } from '../CharacterSheet'

export const LanguageWeapon = ({ characterData }: { characterData: characterDataI }) => {
  return (
    <div className="flex flex-col w-1/2 px-5 bg-yellow-100">
      <div className='flex flex-row'>

        <div className="flex flex-col capitalize px-10 pt-2 gap-2">
          <p className='font-primary text-xl'> Languages: </p>
          {characterData.languages.map((language, index) => (
            <p className="font-accent pl-5" key={index}> {language} </p>
          ))}
        </div>
        <div className="flex flex-col capitalize px-10 pt-2 gap-2">
          <p className='font-primary text-xl'>Proficiencies:</p>
          {characterData.proficiencies.map((proficiency, index) => (
            <p className='font-accent pl-5' key={index}>{proficiency}</p>
          ))}
        </div>
      </div>
      <p className='font-primary p-1  ml-10 text-xl'>Weapons:</p>
      <Accordion className='pl-5 ml-10'>
        {Object.entries(characterData.character_inventory.weapons).map(([type, weapons], index) => (
          <AccordionTab key={index} className='font-primary capitalize py-1 my-1' header={type}>
            {weapons.length ? (
              weapons.map((weapon, weaponIndex) => (
                <p className="flex flex-row p-1 pl-3 font-accent rounded-lg capitalize" key={weaponIndex}>{weapon}</p>
              ))
            ) : (
              <p className='bg-red-300 p-1 pl-3 font-accent rounded-lg capitalize'>empty</p>
            )}
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  )
}