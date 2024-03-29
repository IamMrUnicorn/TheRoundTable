import { Feats } from './Feats'
import { Chips } from "primereact/chips";
export const customChip = (item: string) => {
  return (
    <div className='rounded-lg bg-primary text-center w-min whitespace-nowrap p-1 m-1'>
      <span className='text-primary-content'>{item}</span>
    </div>
  );
};

import { CharacterSheetComponentI } from './CoreStats'

export const Inventory = ({ characterData, editableCharacterData, isEditing, onInputChange }: CharacterSheetComponentI) => {

  return (
    <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll ">
      <div className='flex flex-row justify-center font-primary p-2'>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-orange-400'>
          Copper <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.copper} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'copper')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.copper}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-400'>
          Silver <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.silver} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'silver')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.silver}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-yellow-400'>
          Gold <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.gold} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'gold')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.gold}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-200'>
          Platinum <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.platinum} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'platinum')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.platinum}</span>} 
        </p>
        
      </div>
      <div className='flex flex-row justify-around'>
        <div className='flex flex-col'>
          <h4 className='p-2 font-primary text-xl capitalize'>Items:</h4>
          
          {isEditing
            ?  <Chips value={editableCharacterData.character_inventory.stash} onChange={(e) => onInputChange(e.value || [], 'character_inventory', 'stash')} itemTemplate={customChip} pt={{inputToken: {className: 'text-black bg-white p-1'}, container: {className: 'flex flex-col'}}}/>
            : characterData.character_inventory.stash.map((item, index) => (
              <p className='pl-5 font-accent' key={index}>{item}</p>
            ))
          }
        </div>
        <Feats characterData={characterData} />
      </div>
    </div>
  )
}


// make item cards for both standard weapons, magical weapons and custom items
// add like a "normal" border and a "rare" and a "legendary" card bg and border for items
