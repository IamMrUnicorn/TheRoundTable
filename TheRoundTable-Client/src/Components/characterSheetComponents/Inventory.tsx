import { characterDataI } from '../CharacterSheet'

export const Inventory = ({characterData}:{characterData: characterDataI}) => {

  return (
    <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll bg-yellow-100">
      <div className=''>
        <div className='flex flex-row justify-center font-accent p-2'>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-orange-400'>Copper <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.copper}</span> </p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-400'>Silver <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.silver}</span> </p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-yellow-400'>Gold <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.gold}</span> </p>
          <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-200'>Platinum <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.platinum}</span> </p>
        </div>
        <h4 className='p-2 font-accent capitalize'>Items:</h4>
        {characterData.character_inventory.inventory.inventory.map((item, index) => (
          <p className='pl-5 font2' key={index}>{item}</p>
        ))}
      </div>
    </div>
  )
}