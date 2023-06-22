import { Dispatch, SetStateAction } from "react";




export interface ActionModalProps {
  setPopup: Dispatch<SetStateAction<string>>,

}

const ActionModal = ({setPopup}:ActionModalProps) => {

  return (
    <>
      <input type="checkbox" id="action_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-info flex flex-col">
          <h3 className="font-bold text-lg">Action</h3>
          <div className="flex flex-grow flex-col ">
              <button className="btn btn-neutral" onClick={()=>{setPopup('weapons')}}>use weapons</button>
              <button className="btn btn-neutral" onClick={()=>{setPopup('spells')}}>use spells</button>
              <button className="btn btn-md btn-neutral" onClick={()=>{setPopup('items')}}>use/give items</button>
              <button className="btn btn-md btn-neutral" onClick={()=>{setPopup('items')}}>free actions</button>
              <button className="btn  btn-accent" onClick={()=>{setPopup('other')}}>other <br/>(requires approval)</button>
          </div>

          <div className="flex m-3 justify-center">
            <label htmlFor="action_modal" className="btn  btn-neutral" onClick={() => {setPopup('none')}}>Cancel</label>
          </div>
        
        </div>
      </div>
    </>
  )
}
export default ActionModal

