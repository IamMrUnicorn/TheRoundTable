import {Dispatch, SetStateAction} from "react";
interface ToolsProp {
  setPopup: Dispatch<SetStateAction<string>>
}
const PlayerTools = ({setPopup}:ToolsProp) => {


  return (
    <div className="bg-base-100 h-1/4 font-accent flex flex-row">
      <div className="bg-secondary mx-2 pr-5 rounded-2xl flex flex-row">
        <div className="m-3  flex flex-col">
          <div className="m-2 flex flex-row">
            <label htmlFor="action_modal" onClick={() => {setPopup('action')}} className="btn btn-info">Action</label>
            <label htmlFor="bonus_action_modal" onClick={() => {setPopup('bonus action')}} className="btn btn-success">Bonus Action</label>
          </div>
          <div className="m-2 flex flex-row">
            <label htmlFor="talk_modal" onClick={() => {setPopup('talk')}} className="btn btn-error">talk</label>
            <label htmlFor="roll_modal" onClick={() => {setPopup('roll')}} className="btn btn-warning">roll</label>
            <button className="btn btn-md btn-neutral self-center " >end turn</button>
          </div>
        </div>
      </div>
      <div className="self-center p-5 flex flex-row flex-wrap">
        <button className="btn m-2 btn-block btn-accent ">monster log</button>
        <button className="btn m-2 btn-block btn-accent ">spellbook</button>
      </div>
    </div>
  )
}

export default PlayerTools