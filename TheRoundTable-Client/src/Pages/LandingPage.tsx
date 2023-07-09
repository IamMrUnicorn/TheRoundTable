import { FC, useState, useEffect } from "react";
import CreateRoomModal from "../GameComponents/Modals/CreateRoomModal";

const LandingPage: FC = () => {
  const [code, setCode] = useState("");
  const [createRoomClicked, setcreateRoomClicked] = useState(false);

  const [typingText, setTypingText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = ["host your session", "play dnd", "manage your party", "hang out with friends"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullPhrase = phrases[i];

      setTypingText(
        isDeleting
          ? fullPhrase.substring(0, typingText.length - 1)
          : fullPhrase.substring(0, typingText.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && typingText === fullPhrase) {
        setTimeout(() => setIsDeleting(true), 500);
      } else if (isDeleting && typingText === "") {
        setIsDeleting(false);
        setLoopNum((prevLoopNum) => prevLoopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typingText, isDeleting, typingSpeed, loopNum, phrases]);

  return (
    <div data-theme='TheRoundTable' className="h-[95vh] flex flex-col items-center wavebg gap-1">
      <h1 className="text-6xl">WELCOME TO THE ROUND TABLE</h1>
      <p className="typewriter"> The best place to <span>{typingText}</span> </p>
      <h2 className='text-4xl'>the best place to host and manage your dnd sessions</h2>
      
      <h3 className='text-3xl'>get started by hosting your own session </h3>

      <div className='flex flex-row justify-center'>
        <label htmlFor="createRoom_modal" className='btn btn-accent' onClick={()=>{setcreateRoomClicked(true)}}>create a room</label>
        {createRoomClicked && <CreateRoomModal setPopup={setcreateRoomClicked}/>}
      </div>

      <h3 className='text-3xl'>or join your party with an invite code</h3>

      <div className='flex flex-row justify-center'>
        <input className='self-center' type='text'></input>
        <a className='btn btn-accent btn-sm' href={`rooms/${code}`}>join room</a>
      </div>
      
      <div className='ocean'>
        <div className='wave'></div>
        <div className='wave'></div>
        <div className='wave'></div>
      </div>
    </div>
  )
}

export default LandingPage

//welcome users, encourage character import