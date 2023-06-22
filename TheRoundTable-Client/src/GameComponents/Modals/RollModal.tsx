import React from "react";

const RollModal = ({setPopup}) => {
  return (
    <>
      <input type="checkbox" id="roll_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-error flex flex-col">
          <h3 className="font-bold text-lg">roll for it...</h3>

          <div className="flex flex-col">
            saving throws
            <div className="flex flex-row flex-wrap">
              <button className="btn w-40 btn-neutral">strength saving throw</button>
              <button className="btn w-40 btn-neutral">dexterity saving throw</button>
              <button className="btn w-40 btn-neutral">constitution saving throw</button>
              <button className="btn w-40 btn-neutral">inteligence saving throw</button>
              <button className="btn w-40 btn-neutral">wisdom saving throw</button>
              <button className="btn w-40 btn-neutral">charisma saving throw</button>
            </div>
            stat check
            <div className="flex flex-row flex-wrap">
              <button className="btn w-40 btn-neutral">strength</button>
              <button className="btn w-40 btn-neutral">dexterity</button>
              <button className="btn w-40 btn-neutral">constitution</button>
              <button className="btn w-40 btn-neutral">inteligence</button>
              <button className="btn w-40 btn-neutral">wisdom</button>
              <button className="btn w-40 btn-neutral">charisma</button>
            </div>
            skill checks
            <div className="flex flex-row flex-wrap">
              <button className="btn w-40 btn-neutral">acrobatics</button>
              <button className="btn w-40 btn-neutral">animal handling</button>
              <button className="btn w-40 btn-neutral">arcana</button>
              <button className="btn w-40 btn-neutral">athletics</button>
              <button className="btn w-40 btn-neutral">deception</button>
              <button className="btn w-40 btn-neutral">history</button>
              <button className="btn w-40 btn-neutral">insight</button>
              <button className="btn w-40 btn-neutral">intimidation</button>
              <button className="btn w-40 btn-neutral">investigation</button>
              <button className="btn w-40 btn-neutral">medicine</button>
              <button className="btn w-40 btn-neutral">nature</button>
              <button className="btn w-40 btn-neutral">perception</button>
              <button className="btn w-40 btn-neutral">performance</button>
              <button className="btn w-40 btn-neutral">persuasion</button>
              <button className="btn w-40 btn-neutral">religion</button>
              <button className="btn w-40 btn-neutral">sleight of hand</button>
              <button className="btn w-40 btn-neutral">stealth</button>
              <button className="btn w-40 btn-neutral">survival</button>
            </div>
              
          </div>

          <div className="flex m-3 justify-center">
            <label htmlFor="roll_modal" className="btn" onClick={() => {setPopup('none')}}>Cancel</label>
          </div>
        
        </div>
      </div>
    </>
  )
}
export default RollModal

