import { FC, useState, useContext } from "react";
import { supabaseContext } from '../Utils/supabase';




const SignInPage: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = useContext(supabaseContext);


  const handleLogInWith = async (provider:string) => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider
    });

    if (error) {
      setError(error.message);
    } else {
      console.log(data)
      window.location.href = '/'
    }

    setLoading(false);
  };

  

  return (
    <div className="h-[100vh] flex flex-col text-white items-center justify-evenly bg-black ">
      {loading 
        ? (<div className='bg-primary z-30 h-3/4 w-1/4'>

        </div>) 
      : null}
      <h1 className="title font-neutral">THE ROUND TABLE
        <div className="aurora">
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
        </div>
      </h1>

      <div className='flex flex-col justify-center'>
        <h3 className='text-3xl font-primary'>Get started by creating an account </h3>

        <div className='flex flex-row justify-center'>
          <label className='btn btn-accent capitalize font-accent m-1' >
            {/* <SignUpButton /> */}
            <button className='btn btn primary font-accent' onClick={()=>setLoading(true)}>Sign Up</button>
          </label>

        </div>

      </div>
      <div className='flex flex-col justify-center'>

        <h3 className='text-3xl font-primary'>Or just sign into your account</h3>

        <div className='flex flex-row justify-center'>
          <label className='btn btn-accent capitalize font-accent m-1' >
            {/* <SignInButton /> */}
            <button className='btn btn primary font-accent'>Sign In</button>
          </label>
        </div>
      </div>

    </div>
  )
}

export default SignInPage
