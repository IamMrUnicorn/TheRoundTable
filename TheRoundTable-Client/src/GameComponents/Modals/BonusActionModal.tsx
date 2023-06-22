import React from "react";

const BonusActionModal = ({setPopup}) => {
  return (
    <>
      <input type="checkbox" id="bonus_action_modal" className="modal-toggle" />
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
                <button className="btn btn-error btn-md">equip <br/> different <br/> weapon</button>
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
                <button className="btn btn-warning">spellslot</button>
                <button className="btn btn-warning">magical item</button>
              </div>
              {/* row 2 */}
              <div className="flex flex-row justify-evenly">
                <button className="btn btn-warning">cantrip</button>
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
export default BonusActionModal

