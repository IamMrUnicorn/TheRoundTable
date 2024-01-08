import { Dispatch, SetStateAction, useState, useContext } from "react";
import { supabaseContext } from "../Utils/supabase"


const themes = ['TheRoundTable', 'Stigander', 'Malarie', 'Bojack', 'Zaris']
interface NavProps {
  setTheme: Dispatch<SetStateAction<string>>
}

const NavBar = ({ setTheme }: NavProps) => {
  const supabase = useContext(supabaseContext)

  const [MenuState, setMenuState] = useState(false)

  const OpenCloseMenu = () => {
    setMenuState(!MenuState)
  }

  const handleSignOut = async () => {
    let { error } = await supabase.auth.signOut()
  }

  return (
    <nav className="sticky top-0 ZTOP flex flex-row justify-between bg-secondary min-h-[5vh]">
      <div className="bg-accent flex flex-col justify-center w-[50vw] xl:w-[30vw] rounded-md hover:bg-opacity-80 ">
        <a href='/' className="text-neutral text-center md:text-3xl font-primary hover:text-opacity-90">The Round Table <i className="fa-solid fa-dungeon"></i> <i className="fa-solid fa-dragon"></i></a>
      </div>


      {/* large screen spread out nav bar */}
      <div className="hidden xl:flex xl:flex-row xl:justify-end xl:gap-2 xl:items-center xl:mr-2 ">

        <a href="/info" className="btn btn-neutral btn-sm font-accent capitalize">info <i className="fa-solid fa-lightbulb" /></a>
        <a className="btn btn-neutral btn-sm font-accent capitalize" href='/guide'>new to dnd <i className="fa-solid fa-graduation-cap" /></a>
        <a href="/calendar" className="btn btn-neutral btn-sm font-accent capitalize">calendar <i className="fa-solid fa-calendar-days" /></a>
        <a href="/parties" className="btn btn-neutral btn-sm font-accent capitalize">Active Parties<i className="fa-solid fa-users" /></a>
        <a href="/characters" className="btn btn-neutral btn-sm font-accent capitalize">view characters <i className="fa-solid fa-user-group" /></a>

        <div className="dropdown dropdown-end ">
          <label tabIndex={0} className="btn btn-neutral btn-sm font-accent capitalize ">themes <i className="fa-solid fa-paintbrush" /></label>
          <ul tabIndex={0} className="dropdown-content text-neutral-content menu p-2 shadow bg-neutral ZTOP rounded-box">
            {themes.map((theme, index) => (
              <li onClick={() => { localStorage.setItem('theme', theme); setTheme(theme) }} key={index}><a className="hover:text-neutral-content font-accent capitalize">{theme}</a></li>
            ))}
          </ul>
        </div>
        <button className="btn btn-neutral btn-sm font-accent capitalize" onClick={handleSignOut}>Sign Out<i className="fa-solid fa-arrow-right-from-bracket"/></button>

      </div>

      {/* smaller screens compact menu button */}
      <div className="flex flex-row items-center xl:hidden">

        <details className="dropdown dropdown-end">
          <summary onClick={OpenCloseMenu} className={`btn btn-neutral btn-sm btn-circle swap swap-rotate m-1 ${MenuState ? 'swap-active' : ''}`}>
            <i className="swap-off fa-solid fa-bars" />
            <i className="swap-on fa-solid fa-xmark" />
          </summary>
          <ul className="dropdown-content z-10 menu p-2 shadow bg-neutral rounded-box font-primary">
            <li className="m-1"> <a href="/info" className="btn btn-neutral btn-sm capitalize  hover:bg-accent hover:text-neutral-content">info <i className="fa-solid fa-lightbulb" /> </a> </li>
            <li className="m-1"> <a href="/calendar" className="btn btn-neutral btn-sm capitalize  hover:bg-accent hover:text-neutral-content">calendar <i className="fa-solid fa-calendar-days" /> </a> </li>
            <li className="m-1"> <a className="btn btn-neutral btn-sm capitalize hover:bg-accent hover:text-neutral-content" target="_blank" href='https://www.ign.com/articles/how-to-play-dungeons-and-dragons'>new to dnd <i className="fa-solid fa-graduation-cap" /> </a> </li>
            <li className="m-1"> <a href="/parties" className="btn btn-neutral btn-sm capitalize  hover:bg-accent hover:text-neutral-content">Active Parties<i className="fa-solid fa-users" /> </a> </li>
            <li className="m-1"> <a href="/characters" className="btn btn-neutral btn-sm capitalize  hover:bg-accent hover:text-neutral-content">view characters <i className="fa-solid fa-user-group" /> </a> </li>
          </ul>
        </details>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-neutral btn-circle m-1"><i className="fa-solid fa-paintbrush" /></label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral text-neutral-content z-10 rounded-box ">
            {themes.map((theme, index) => (
              <li onClick={() => { localStorage.setItem('theme', theme); setTheme(theme) }} key={index}><a className="hover:text-neutral-content">{theme}</a></li>
            ))}
          </ul>
        </div>
        <button className="btn btn-neutral btn-sm btn-circle font-accent capitalize" onClick={handleSignOut}><i className="fa-solid fa-arrow-right-from-bracket"/></button>
      </div>

    </nav>
  )
}

export default NavBar
