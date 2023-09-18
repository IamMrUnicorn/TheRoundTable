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
    <div className="h-[95vh] flex flex-col text-white items-center justify-evenly bg-black ">
        <h1 className="title font-neutral">THE ROUND TABLE
          <div className="aurora">
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
          </div>
        </h1>

      <div className='flex flex-col justify-center'>

        <h3 className='text-3xl font-primary text-center'>Adventure awaits, </h3>
        <h3 className='text-3xl font-primary'>Are you ready to sit at The Round Table </h3>


        <div className='flex flex-row justify-center'>
          <input className='self-center rounded-lg p-1 m-1 font-accent text-black' type='text' onChange={(e) => { setCode(e.target.value) }}></input>
          <a className='btn btn-accent capitalize font-accent btn-sm m-1' href={`rooms/${code}`}>join room</a>
        </div>
      </div>
      <div className='flex flex-col justify-center'>
        <h3 className='text-3xl font-primary'>Get started by hosting your own session </h3>

        <div className='flex flex-row justify-center'>
          <label htmlFor="createRoom_modal" className='btn btn-accent capitalize font-accent m-1' onClick={() => { setcreateRoomClicked(true) }}>create a room</label>
          {createRoomClicked && <CreateRoomModal setPopup={setcreateRoomClicked} />}
        </div>

      </div>

    </div>
  )
}

export default LandingPage
