import { FC, useState, useEffect, useContext } from "react";
import { useUser } from '@clerk/clerk-react';
import CreateRoomModal from "../GameComponents/Modals/CreateRoomModal";
import { supabaseContext } from "../supabase";

const LandingPage: FC = () => {
  const [code, setCode] = useState("");
  const [createRoomClicked, setcreateRoomClicked] = useState(false);
  const { user } = useUser();
  const supabase = useContext(supabaseContext)

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
    <div data-theme='TheRoundTable' className="h-[95vh] flex flex-col text-white items-center justify-evenly bg-black font-primary">
        <h1 className="title">THE ROUND TABLE
          <div className="aurora">
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
          </div>
        </h1>

      <div className='flex flex-col justify-center'>
        <h3 className='text-3xl font-accent'>get started by hosting your own session </h3>

        <div className='flex flex-row justify-center'>
          <label htmlFor="createRoom_modal" className='btn btn-accent m-1' onClick={() => { setcreateRoomClicked(true) }}>create a room</label>
          {createRoomClicked && <CreateRoomModal setPopup={setcreateRoomClicked} />}
        </div>

      </div>
      <div className='flex flex-col justify-center'>

        <h3 className='text-3xl font-accent'>or join your party with the provided invite code</h3>

        <div className='flex flex-row justify-center'>
          <input className='self-center rounded-lg p-1 m-1 text-black' type='text' onChange={(e) => { setCode(e.target.value) }}></input>
          <a className='btn btn-accent btn-sm m-1' href={`rooms/${code}`}>join room</a>
        </div>
      </div>

    </div>
  )
}

export default LandingPage
