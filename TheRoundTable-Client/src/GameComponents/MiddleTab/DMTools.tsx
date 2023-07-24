import {Dispatch, SetStateAction} from "react";
interface ToolsProp {
  setPopup: Dispatch<SetStateAction<string>>
}
const DMTools = ({setPopup}:ToolsProp) => {


  return (
    <div className="bg-base-100 h-[20vh] flex flex-row justify-around">
      <div className="bg-secondary m-5  rounded-2xl flex flex-row">
        <div className="m-3 h-min w-min flex flex-col">
          <div className="m-1 flex flex-row">
            <label htmlFor="action_modal" onClick={() => {setPopup('action')}} className="btn btn-sm btn-info">Action</label>
            <label htmlFor="bonus_action_modal" onClick={() => {setPopup('bonus action')}} className="btn btn-sm btn-success">Bonus Action</label>
          </div>
          <div className="m-1 flex flex-row">
            <label htmlFor="talk_modal" onClick={() => {setPopup('talk')}} className="btn btn-sm btn-error ">talk</label>
            <label htmlFor="roll_modal" onClick={() => {setPopup('roll')}} className="btn btn-sm btn-warning ">roll</label>
            <button className="btn btn-sm btn-neutral self-center " >end turn</button>
          </div>
        </div>
      </div>
      <div className="self-center p-5 flex flex-col ">
        <button className="btn m-2 btn-block btn-accent ">NPC select</button>
        <button className="btn m-2 btn-block btn-accent ">prompt player</button>
        <button className="btn m-2 btn-block btn-accent "></button>
      </div>
      <div className="self-center p-5 flex flex-col ">
        <button className="btn m-2 btn-block btn-accent ">DM guide</button>
        <button className="btn m-2 btn-block btn-accent ">monster manual</button>
        <button className="btn m-2 btn-block btn-accent ">spell lookup</button>
      </div>
    </div>
  )
}

export default DMTools