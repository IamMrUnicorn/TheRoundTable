import {Dispatch, SetStateAction} from "react";
interface ToolsProp {
  setPopup: Dispatch<SetStateAction<string>>
}
const DMTools = ({setPopup}:ToolsProp) => {
  

  return (
    <div className="bg-base-100 h-1/5 flex flex-row justify-around">
      <div className="bg-secondary m-5  rounded-2xl flex flex-row">
        <div className="m-3 h-min w-min flex flex-col">
          <div className="m-1 flex flex-row">
            <label htmlFor="action_modal" onClick={() => {setPopup('action')}} className="btn btn-sm btn-info font-accent capitalize">Action</label>
            <label htmlFor="bonus_action_modal" onClick={() => {setPopup('bonus action')}} className="btn btn-sm btn-success font-accent capitalize">Bonus Action</label>
          </div>
          <div className="m-1 flex flex-row">
            <label htmlFor="talk_modal" onClick={() => {setPopup('talk')}} className="btn btn-sm btn-error font-accent capitalize">talk</label>
            <label htmlFor="roll_modal" onClick={() => {setPopup('roll')}} className="btn btn-sm btn-warning font-accent capitalize">roll</label>
            <button className="btn btn-sm btn-neutral self-center font-accent capitalize" >end turn</button>
          </div>
        </div>
      </div>
      <div className="self-center p-5 flex flex-col ">
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize">NPC select</button>
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize">prompt player</button>
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize"></button>
      </div>
      <div className="self-center p-5 flex flex-col ">
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize">DM guide</button>
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize">monster manual</button>
        <button className="btn btn-sm m-2 btn-block btn-accent font-accent capitalize">spell lookup</button>
      </div>
    </div>
  )
}

export default DMTools