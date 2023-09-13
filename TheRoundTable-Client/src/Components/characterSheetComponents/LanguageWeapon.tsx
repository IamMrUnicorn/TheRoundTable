import { Accordion, AccordionTab } from 'primereact/accordion'
import { characterDataI } from '../CharacterSheet'

export const LanguageWeapon = ({characterData}:{characterData: characterDataI}) => {
  return (
    <div className="flex flex-col  p-5 bg-yellow-100">
            <div className="flex flex-row gap-2">
              languages:
              {characterData.languages.map((language, index) => (
                <p className="" key={index}> {language} </p>
              ))}
            </div>
            <div className="flex flex-row gap-2">
              proficiencies:
              {characterData.proficiencies.map((proficiency, index) => (
                <p key={index}>{proficiency}</p>
              ))}
            </div>
            <Accordion>
            {Object.entries(characterData.character_inventory.weapons).map(([type, weapons], index) => (
              <AccordionTab key={index} contentClassName="bg-red-300" header={type}>
                {weapons.length ? (
                  weapons.map((weapon, weaponIndex) => (
                    <p className="flex flex-row" key={weaponIndex}>{weapon}</p>
                  ))
                ) : (
                  <p>empty</p>
                )}
              </AccordionTab>
            ))}
          </Accordion>
          </div>
  )
}