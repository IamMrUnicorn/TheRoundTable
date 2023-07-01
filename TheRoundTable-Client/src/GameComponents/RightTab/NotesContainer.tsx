import { useState } from "react";
const pages = ['goblin drawing', 'mushroom sketch', 'dragon drawing', 'attack plan','new note1']
const NotesContainer = () => {
  const [selectedNote, setSelectedNote] = useState('select a note')
  return (
    <div className="bg-secondary h-[95vh]">

      <div className="bg-neutral h-[47vh] Notes-Table">
      </div>

      <div className="h-[47vh]">


        <div className="bg-primary flex flex-row ">

          <div className="dropdown dropdown-start">
            <label tabIndex={0} className="btn btn-accent btn-sm m-1"> menu</label>

            <ul className="dropdown-content z-10 menu p-2 shadow bg-accent  rounded-box ">
              <li> <button className="btn btn-sm btn-accent" onClick={() => { console.log('update the the drawing in the database') }}>save page <i className="fa-solid fa-box-archive"/></button> </li>
              <li> <button className="btn btn-sm btn-accent" onClick={() => { console.log('create a new drop down menu option called new note and select it') }}>create new page <i className="fa-solid fa-file-circle-plus"/></button> </li>
              <li> <button className="btn btn-sm btn-accent" onClick={() => { console.log('activate a popup over the table notes with this current player canvas state') }}>push to table <i className="fa-solid fa-arrow-up-from-bracket"/></button> </li>
              <li> <button className="btn btn-sm btn-accent" onClick={() => { console.log('activate a popup over the table notes with this current player canvas state') }}>delete note <i className="fa-solid fa-trash"/></button> </li>
            </ul>
          </div>

          <div className="dropdown dropdown-start">
            <label tabIndex={0} className="btn btn-sm btn-accent m-1">{selectedNote}</label>
            
            <ul className="dropdown-content z-10 menu p-2 shadow bg-accent rounded-box ">
              {pages.map((name, index) => (
                <li key={index}><button className="btn btn-sm btn-accent" onClick={() => { setSelectedNote(name) }}>{name}</button></li>
              ))}
            </ul>
          </div>

        </div>
        <div className="bg-neutral h-full">
        </div>

      </div>
    </div>
  )
}

export default NotesContainer
