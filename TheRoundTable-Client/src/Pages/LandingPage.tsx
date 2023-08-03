import { FC, useState, useEffect, useContext } from "react";
import { useUser } from '@clerk/clerk-react';
import CreateRoomModal from "../GameComponents/Modals/CreateRoomModal";
import { supabaseContext } from "../supabase";

const LandingPage: FC = () => {
  const [code, setCode] = useState("");
  const [createRoomClicked, setcreateRoomClicked] = useState(false);
  const { user } = useUser();
  const supabase = useContext(supabaseContext)
  const [typingText, setTypingText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = ["play dnd", "hang out with friends", "store characters", "track your session", "manage your party"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullPhrase = phrases[i];

      setTypingText(
        isDeleting
          ? fullPhrase.substring(0, typingText.length - 1)
          : fullPhrase.substring(0, typingText.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 150);

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

  useEffect(() => {
    const updateUserInDatabase = async () => {
      if (!user) return;

      // Check if user already exists in Supabase
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user:', error);
        return;
      }

      // If user doesn't exist in Supabase, add them
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              clerk_user_id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              username: user.username
            },
          ]);

        if (insertError) {
          console.error('Error inserting user:', insertError);
        }
      } else {
        // If user already exists, you can choose to update their record
        const { error: updateError } = await supabase
          .from('users')
          .update({
            // Update any fields that might have changed
            email: user.emailAddresses[0]?.emailAddress,
            username: user.username
          })
          .eq('clerk_user_id', user.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
        }
      }
    };

    updateUserInDatabase();
  }, [])
  return (
    <div data-theme='TheRoundTable' className="h-[95vh] flex flex-col text-white items-center justify-evenly wavebg">
      <h1 className="text-6xl">WELCOME TO THE ROUND TABLE</h1>
      <p className="typewriter"> The best place to <span>{typingText}</span> </p>

      <div className='flex flex-col justify-center'>
        <h3 className='text-3xl'>get started by hosting your own session </h3>

        <div className='flex flex-row justify-center'>
          <label htmlFor="createRoom_modal" className='btn btn-accent' onClick={() => { setcreateRoomClicked(true) }}>create a room</label>
          {createRoomClicked && <CreateRoomModal setPopup={setcreateRoomClicked} />}
        </div>

      </div>
      <div className='flex flex-col justify-center'>

        <h3 className='text-3xl'>or join your party with the provided invite code</h3>

        <div className='flex flex-row justify-center'>
          <input className='self-center text-black' type='text' onChange={(e)=>{setCode(e.target.value)}}></input>
          <a className='btn btn-accent btn-sm' href={`rooms/${code}`}>join room</a>
        </div>
      </div>

    </div>
  )
}

export default LandingPage

//welcome users, encourage character import