import { Dispatch, SetStateAction } from "react";




export interface InventoryModalProps {
  setPopup: Dispatch<SetStateAction<string>>,
  CharacterInventory: {
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    inventory: string[];
  } | undefined
}

const InventoryModal = ({setPopup, CharacterInventory}:InventoryModalProps) => {
  if (CharacterInventory){
    const inventory = JSON.parse(CharacterInventory)
    console.log(inventory)
  }
  return (
    <>
      <input type="checkbox" id="action_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-info flex flex-col">
          <h3 className="font-bold text-lg">Action</h3>
          {/* weapons and items row */}
          <div className="flex flex-row justify-evenly">
            {/* weapons column */}
            <div className="flex flex-col ">
              {/* row 1 */}
              <p>weapons</p>
              <div className="flex flex-row justify-evenly">
                <button className="btn btn-error">use <br/> equiped <br/> weapon</button>
                <div className="dropdown">
                  <label tabIndex={0} className="btn m-1">equip weapon</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {Object.keys(weapons).map((weaponType, index) => (
                      <li key={index}><a>{weaponType}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* row 2 */}
              <div className="flex flex-row justify-evenly">
                <button className="btn btn-error">grab</button>
                <button className="btn btn-accent">other <br/> (dm approval)</button>
              </div>
            </div>
            {/* items column */}
            <div className="flex flex-col">
              <p>items</p>
              <div className="flex flex-row justify-evenly">
                {/* button */}
                <button className="btn btn-success">use an item</button>
                {/* dropdown */}
              </div>
              <div className="flex flex-row justify-evenly">
                {/* button */}
                <button className="btn btn-success">give an item</button>
                {/* dropdown */}
              </div>
              <div className="flex flex-row justify-evenly">
                {/* button */}
                <button className="btn btn-accent">other <br/> (dm approval)</button>
                {/* dropdown */}
              </div>
            </div> 
          </div>

          {/* spells and other */}
          <div className="flex flex-row justify-evenly">
            {/* weapons column */}
            <div className="flex flex-col ">
              <p>magic</p>
              {/* row 1 */}
              <div className="flex flex-row justify-evenly">
                <label htmlFor="spell_modal" className="btn btn-warning">spells</label>
                <div className="dropdown">
                  <label tabIndex={0} className="btn m-1">use magical weapon</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {exampleData.magicalWeapons.map((name, index) => (
                      <li key={index}><a>{name}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* row 2 */}
              <div className="flex flex-row justify-evenly">
                <div className="dropdown">
                  <label tabIndex={0} className="btn m-1">cantrips</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {exampleData.cantrips.map((name, index) => (
                      <li key={index}><a>{name}</a></li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-accent">other <br/> (dm approval)</button>
              </div>
            </div>
            {/* items column */}
            <div className="flex flex-col">
              <p>custom request</p>
              <div className="flex flex-col">
                <button className="btn btn-accent">Free Action <br/> (dm approval)</button>
                <button className="btn btn-accent">OTHER <br/> (dm approval)</button>
              </div>
            </div> 
          </div>

          <div className="flex m-3 justify-center">
            <label htmlFor="action_modal" className="btn" onClick={() => {setPopup('none')}}>Cancel</label>
          </div>
        
        </div>
      </div>
    </>
  )
}
export default InventoryModal

