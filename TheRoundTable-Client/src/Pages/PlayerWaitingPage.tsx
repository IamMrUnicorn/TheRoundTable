

export const PlayerWaitingPage = () => {

  return (
    <div>
      {/* if user has not selected a character. prompt character selection */}
      {/* group whiteboard area */}
      <div className="bg-neutral m-2 rounded-2xl h-2/5">
        <Tldraw/>
      </div>
    </div>
  )
}