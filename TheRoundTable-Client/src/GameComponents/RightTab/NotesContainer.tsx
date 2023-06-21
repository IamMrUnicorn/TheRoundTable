import {useState} from "react";
const things = ['a','b','c','d','e']
const NotesContainer = () => {
  const [selectedNote, setSelectedNote] = useState('select a note')
  return (
    <div className="bg-neutral h-full">

      <div className="bg-neutral h-96 Notes-Table ">
      </div>

      <div className="Notes-Personal">
        <div className="bg-primary Notes-Buttons-Container flex flex-row justify-center items-center">
          
          <div className="dropdown">
            <label tabIndex={0} className="btn m-1">pages</label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {things.map((name, index) => (
                <li onClick={() => {setSelectedNote(name)}} key={index}><a>{name}</a></li>
              ))}
            </ul>
          </div>

          <button className="btn btn-sm btn-accent Notes-Buttons-SavePage" onClick={() => {console.log('update the the drawing in the database')}}>save page</button>
          <button className="btn btn-sm btn-accent Notes-Buttons-CreateNewPage" onClick={() => {console.log('create a new drop down menu option called new note and select it')}}>create new page</button>
          <button className="btn btn-sm btn-accent Notes-Buttons-PushToTable" onClick={() => {console.log('activate a popup over the table notes with this current player canvas state')}}>push to table</button>

        </div>
        <div className="bg-black">
        </div>

      </div>
    </div>
  )
}

export default NotesContainer
