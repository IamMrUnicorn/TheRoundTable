import { UserButton, SignOutButton } from "@clerk/clerk-react";
import {Dispatch, SetStateAction} from "react";

const themes = ['Stigander', 'Malarie', 'Bojack', 'Zaris', 'retro', 'dracula', 'aqua', 'cyberpunk', 'coffee']
interface NavProps {
  setTheme: Dispatch<SetStateAction<string>>
}

const NavBar = ({setTheme}:NavProps) => {
  return (
    <nav className="flex flex-row justify-between bg-secondary h-[5vh]">
      <div className="bg-accent flex flex-col justify-center w-[50vw] xl:w-[30vw] rounded-md ">
        <p className="text-neutral md:text-3xl font-bold">THE ROUND TABLE <i className="fa-solid fa-dungeon"></i> <i className="fa-solid fa-dragon"></i></p>
      </div>

      <div className=" flex flex-col xl:flex-row xl:justify-end gap-1 xl:items-center xl:mr-10 ">

        <div className="dropdown ">
          <label tabIndex={0} className="btn btn-neutral m-1">themes</label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral z-10 rounded-box w-52">
            {themes.map((theme, index) => (
              <li onClick={() => {localStorage.setItem('theme', theme); setTheme(theme)}} key={index}><a>{theme}</a></li>
            ))}
          </ul>
        </div>

        <a href="/import" className="btn btn-accent btn-sm ">import character</a>
        <a href="/characters" className="btn btn-accent btn-sm ">view characters</a>
        <a href="/calendar" className="btn btn-accent btn-sm ">calendar</a>
        <a className="btn btn-accent btn-sm " target="_blank" href='https://www.ign.com/articles/how-to-play-dungeons-and-dragons'>getting started with dnd</a>
        <UserButton/>
      </div>
    </nav>
  )
}

export default NavBar
