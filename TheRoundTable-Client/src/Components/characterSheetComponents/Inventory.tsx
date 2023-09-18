import { Feats } from './Feats'
import { characterDataI } from '../CharacterSheet'

export const Inventory = ({ characterData }: { characterData: characterDataI }) => {

  return (
    <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll bg-yellow-100">
      <div className='flex flex-row justify-center font-primary p-2'>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-orange-400'>Copper <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.copper}</span> </p>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-400'>Silver <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.silver}</span> </p>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-yellow-400'>Gold <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.gold}</span> </p>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-200'>Platinum <br /> <span className='text-2xl'>{characterData.character_inventory.inventory.platinum}</span> </p>
      </div>
      <div className='flex flex-row justify-around'>
        <div className='flex flex-col'>
          <h4 className='p-2 font-primary capitalize'>Items:</h4>
          {characterData.character_inventory.inventory.inventory.map((item, index) => (
            <p className='pl-5 font-accent' key={index}>{item}</p>
          ))}
        </div>
        <Feats characterData={characterData} />
      </div>
    </div>
  )
}