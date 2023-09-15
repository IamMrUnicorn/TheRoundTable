import { UserButton, SignOutButton } from "@clerk/clerk-react";
import { Dispatch, SetStateAction } from "react";

const themes = ['TheRoundTable', 'Stigander', 'Malarie', 'Bojack', 'Zaris']
interface NavProps {
  setTheme: Dispatch<SetStateAction<string>>
}

const NavBar = ({ setTheme }: NavProps) => {
  return (
    <nav className="flex flex-row justify-between bg-secondary min-h-[5vh]">
      <div className="bg-accent flex flex-col justify-center w-[50vw] xl:w-[30vw] rounded-md  ">
        <a href='/' className="text-neutral text-center md:text-3xl font-accent hover:text-opacity-75">The Round Table <i className="fa-solid fa-dungeon"></i> <i className="fa-solid fa-dragon"></i></a>
      </div>


      {/* large screen spread out nav bar */}
      <div className="hidden xl:flex xl:flex-row xl:justify-end xl:gap-1 xl:items-center xl:mr-10 ">

        <a href="/import" className="btn btn-neutral btn-sm font2 capitalize">import character <i className="fa-solid fa-user-plus" /></a>
        <a href="/characters" className="btn btn-neutral btn-sm font2 capitalize">view characters <i className="fa-solid fa-people-group" /></a>
        <a href="/calendar" className="btn btn-neutral btn-sm font2 capitalize">calendar <i className="fa-solid fa-calendar-days" /></a>
        <a className="btn btn-neutral btn-sm font2 capitalize" target="_blank" href='https://www.google.com/search?q=how+to+play+dnd&oq=how+to+play+dnd'>new to dnd <i className="fa-solid fa-graduation-cap" /></a>

        <div className="dropdown dropdown-end ">
          <label tabIndex={0} className="btn btn-neutral btn-sm font2 capitalize m-1">themes <i className="fa-solid fa-paintbrush" /></label>
          <ul tabIndex={0} className="dropdown-content text-neutral-content menu p-2 shadow bg-neutral ZTOP rounded-box">
            {themes.map((theme, index) => (
              <li onClick={() => { localStorage.setItem('theme', theme); setTheme(theme) }} key={index}><a className="hover:text-neutral-content font2 capitalize">{theme}</a></li>
            ))}
          </ul>
        </div>
        <UserButton />
      </div>

      {/* smaller screens compact menu button */}
      <div className="flex flex-row items-center xl:hidden">

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-neutral btn-sm btn-circle swap swap-rotate m-1">
            <input type="checkbox" />
            <i className="swap-off fa-solid fa-bars" />
            <i className="swap-on fa-solid fa-xmark" />
          </label>
          <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-neutral rounded-box ">
            <li> <a href="/import" className="btn btn-neutral btn-sm  hover:text-neutral-content">import character <i className="fa-solid fa-user-plus" /> </a> </li>
            <li> <a href="/characters" className="btn btn-neutral btn-sm  hover:text-neutral-content">view characters <i className="fa-solid fa-people-group" /> </a> </li>
            <li> <a href="/calendar" className="btn btn-neutral btn-sm  hover:text-neutral-content">calendar <i className="fa-solid fa-calendar-days" /> </a> </li>
            <li> <a className="btn btn-neutral btn-sm hover:text-neutral-content" target="_blank" href='https://www.ign.com/articles/how-to-play-dungeons-and-dragons'>new to dnd <i className="fa-solid fa-graduation-cap" /> </a> </li>
          </ul>
        </div>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-neutral btn-circle m-1"><i className="fa-solid fa-paintbrush" /></label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral text-neutral-content z-10 rounded-box ">
            {themes.map((theme, index) => (
              <li onClick={() => { localStorage.setItem('theme', theme); setTheme(theme) }} key={index}><a className="hover:text-neutral-content">{theme}</a></li>
            ))}
          </ul>
        </div>
        <UserButton />
      </div>

    </nav>
  )
}

export default NavBar
