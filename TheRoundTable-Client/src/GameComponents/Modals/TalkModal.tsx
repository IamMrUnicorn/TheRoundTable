import { useState} from "react";

const players = ['stigander', 'zaris', 'dragon', 'malarie', 'bojack', 'goblin', 'outloud', 'closest']

interface TalkModalProps {
  setPopup: (arg0:string) => void,
}

const TalkModal = ({setPopup}:TalkModalProps) => {
  const [target, setTarget] = useState('targets')
  return (
    <>
      <input type="checkbox" id="talk_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box bg-warning flex flex-col">
          <h3 className="font-bold text-lg">Talk to...</h3>
          <div className="dropdown">
            <label tabIndex={0} className="btn m-1">{target}</label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {players.map((name, index) => (
                <li onClick={() => {setTarget(name)}} key={index}><a>{name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <input type="text" placeholder="say something" className="input w-full max-w-xs" />
          </div>

          <div className="flex m-3 justify-center">
            <label htmlFor="talk_modal" className="btn" onClick={() => {setPopup('none')}}>Cancel</label>
          </div>
        
        </div>
      </div>
    </>
  )
}
export default TalkModal

