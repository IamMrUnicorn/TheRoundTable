import { Feats } from './Feats'
import { Chips } from "primereact/chips";
import { customChip } from "../../Pages/CharacterImportPage";

import { CharacterSheetComponentI } from './CoreStats'

export const Inventory = ({ characterData, editableCharacterData, isEditing, onInputChange }: CharacterSheetComponentI) => {

  return (
    <div className="flex flex-col flex-wrap overflow-y-scroll h-1/2 hiddenScroll ">
      <div className='flex flex-row justify-center font-primary p-2'>
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-orange-400'>
          Copper <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.inventory.copper} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'inventory', 'copper')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.inventory.copper}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-400'>
          Silver <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.inventory.silver} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'inventory', 'silver')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.inventory.silver}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-yellow-400'>
          Gold <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.inventory.gold} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'inventory', 'gold')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.inventory.gold}</span>} 
        </p>
        
        <p className='h-20 text-center pt-4 rounded-full w-20 mr-4 border border-solid border-black bg-slate-200'>
          Platinum <br /> 
          {isEditing 
            ? <input type='number' min='0' max='9999999' className='w-1/2' value={editableCharacterData.character_inventory.inventory.platinum} onChange={(e)=>onInputChange(e.target.value || 0, 'character_inventory', 'inventory', 'platinum')} /> 
            : <span className='text-2xl'>{characterData.character_inventory.inventory.platinum}</span>} 
        </p>
        
      </div>
      <div className='flex flex-row justify-around'>
        <div className='flex flex-col'>
          <h4 className='p-2 font-primary text-xl capitalize'>Items:</h4>
          
          {isEditing
            ?  <Chips value={editableCharacterData.character_inventory.inventory.inventory} onChange={(e) => onInputChange(e.value || [], 'character_inventory', 'inventory', 'inventory')} itemTemplate={customChip} pt={{inputToken: {className: 'text-black bg-white p-1'}, container: {className: 'flex flex-col'}}}/>
            : characterData.character_inventory.inventory.inventory.map((item, index) => (
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
