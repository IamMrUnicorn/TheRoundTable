import { FC, useState, useContext } from "react";
import { supabaseContext } from '../Utils/supabase';
import Title from "../Components/Title";



const SignInPage: FC = () => {
  const [openInput, setOpenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const supabase = useContext(supabaseContext);

  const handleEmailChange = (e: any) => {
    setTempEmail(e.target.value)
    const value = e.target.value;
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      // If the input value matches the regex, update the state
      setEmail(value);
    } else {
      setError('Please Enter A Valid Email')
      // Optionally handle the case where it's not matching
      // You could provide user feedback or just not update the state
    }
  };

  const handleLogInWithProvider = async (provider: string) => {
    setLoading(true);

    try {

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
      });

      if (error) {
        throw error
      }

    } catch (error) {
    }
    finally {
      setLoading(false);
    }


  };

  const handleLogInWithOTP = async () => {
    setLoading(true);
    setError('');

    let { data, error } = await supabase.auth.signInWithOtp({
      email: email
    })

    if (error) {
      setError(error.message);
    } else {
      console.log(data)
      setError('email sent, check your inbox for the magic link')
    }

    setLoading(false);
  };




  return (
    <div className="p-10 overflow-hidden flex flex-col h-screen text-white items-center gap-20 bg-black ">
      

      <Title/>



      <div className='flex flex-col m-20 justify-center '>
        <div className='flex flex-row justify-center '>
          <label className='flex flex-row gap-2 capitalize font-accent m-1' >
            <button className='btn btn-primary font-accent' onClick={() => setOpenInput((prev) => !prev)}>{openInput ? 'cancel' : 'Sign Up'}</button>
            {openInput && <div className='flex flex-row gap-2'> <input className='text-black p-2 rounded-md' type='email' placeholder='enter your email' value={tempEmail} onChange={handleEmailChange} /> <button className='btn btn-primary' onClick={handleLogInWithOTP} disabled={loading} > send link </button></div>}
          </label>
        </div>
        <div className='font-primary self-center flex flex-row text-xl '> <span className='bg-black h-1 grow' /> <p>Or</p> <span className='bg-black h-1 grow' /></div>
        <div className='flex flex-col p-2 justify-center gap-2'>
          <button className='btn font-accent capitalize hover:text-black hover:bg-white ' onClick={() => handleLogInWithProvider('google')}> continue with <i className="fa-brands fa-google" /></button>
          <button className='btn font-accent capitalize hover:text-white hover:bg-green-400 ' onClick={() => handleLogInWithProvider('azure')}> continue with <i className="fa-brands fa-microsoft" /></button>
        </div>
      </div>

    </div>
  )
}

export default SignInPage

