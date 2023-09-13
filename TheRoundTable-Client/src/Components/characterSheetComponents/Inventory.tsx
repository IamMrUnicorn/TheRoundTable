import { characterDataI } from '../CharacterSheet'

export const Inventory = ({characterData}:{characterData: characterDataI}) => {

  return (
    <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll bg-yellow-100">
      <div className=''>
        <div className='flex flex-row'>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-orange-400'>Copper <br /> {characterData.character_inventory.inventory.copper}</p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-slate-400'>Silver <br /> {characterData.character_inventory.inventory.silver}</p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-yellow-400'>Gold <br /> {characterData.character_inventory.inventory.gold}</p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 bg-slate-200'>Platinum <br /> {characterData.character_inventory.inventory.platinum}</p>
        </div>
        <h4>Items:</h4>
        {characterData.character_inventory.inventory.inventory.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
    </div>
  )
}