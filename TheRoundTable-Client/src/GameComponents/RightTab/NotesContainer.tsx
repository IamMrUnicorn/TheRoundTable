import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

const NotesContainer = () => {
  return (
    <div className="bg-secondary h-[95vh]">

      <div className="bg-neutral m-2 rounded-2xl h-2/5">
        <Tldraw/>
      </div>

      <div className="bg-primary rounded-lg mx-3 flex flex-row justify-center">
        <p className='font-accent capitalize'><i className='fa-solid fa-arrow-up'/> public | private <i className='fa-solid fa-arrow-down'/></p>
      </div>
      <div className="bg-neutral m-2 rounded-2xl h-2/5">
        <Tldraw/>
      </div>

    </div>
  )
}

export default NotesContainer
