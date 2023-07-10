

interface CreateRoomModalProps {
  setPopup: (arg0:boolean) => void,
}

const CreateRoomModal = ({setPopup}:CreateRoomModalProps) => {
  return (
    <>
      <input type="checkbox" id="createRoom_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-warning flex flex-col">
{/* input text box asking for a password, put a side note that if you dont care for a password then leave this space empty */}
{/* input text box asking for the campaign name / party name */}

          <div className="flex flex-row m-3 justify-end">
            <label htmlFor="createRoom_modal" className="btn" onClick={() => {setPopup(false)}}>Cancel</label>
          </div>
        
        </div>
      </div>
    </>
  )
}
export default CreateRoomModal

