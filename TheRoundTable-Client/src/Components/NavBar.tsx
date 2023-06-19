import { SignOutButton } from "@clerk/clerk-react";
import { useEffect } from "react";

const themes = ['Stigander', 'Malarie', 'Bojack', 'Zaris', 'retro', 'dracula', 'aqua', 'cyberpunk', 'coffee']
interface NavProps {
  avatar: string
}

const NavBar = ({avatar}:NavProps) => {
  return (
    <nav className="flex flex-row justify-between bg-secondary Nav-Bar">
      <div className="Nav-Logo bg-accent flex flex-col justify-center w-[640px] rounded-md ">
        <p className="text-neutral text-3xl font-bold">THE ROUND TABLE <i className="fa-solid fa-dungeon"></i> <i className="fa-solid fa-dragon"></i></p>
      </div>

      <div className="Nav-Buttons flex flex-row justify-end mr-10 w-96">

        <div className="dropdown">
          <label tabIndex={0} className="btn m-1">themes</label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {themes.map((theme, index) => (
              <li onClick={() => {localStorage.setItem('theme', theme)}} key={index}><a>{theme}</a></li>
            ))}
          </ul>
        </div>

        <a href="/import" className="btn btn-accent btn-sm ">import character</a>
        <a href="/characters" className="btn btn-accent btn-sm ">view characters</a>
        <a href="/calendar" className="btn btn-accent btn-sm ">calendar</a>
        <a className="btn btn-accent btn-sm " target="_blank" href='https://www.ign.com/articles/how-to-play-dungeons-and-dragons'>getting started with dnd</a>

        <div className=" avatar">
          <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 hover:cursor-pointer">
            <a href="/account"> <img src={avatar}></img> </a>
          </div>
        </div>

        <SignOutButton>
          <button className="btn btn-accent btn-circle Nav-SignIn">sign out</button>
        </SignOutButton>
      </div>
    </nav>
  )
}

export default NavBar

inital commit
step 1 of reorganization and migration to typescript and react router
created pages directory to organize pages
imported the navbar component
setup the