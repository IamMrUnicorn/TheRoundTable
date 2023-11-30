import { FC, useState, useContext } from "react";
import { supabaseContext } from '../Utils/supabase';

const SignInPage: FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openInput, setOpenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [error, setError] = useState('');
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
    setError('');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider
    });

    if (error) {
      setError(error.message);
    } else {
      console.log(data)
    }

    setLoading(false);
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
    <div className="h-[100vh] flex flex-col text-white items-center justify-evenly bg-black ">
      {openModal
        ? (<div  className='bg-secondary flex flex-row items-center justify-center absolute bg-opacity-60 h-screen w-screen z-30 '>
          <div className='flex flex-col bg-accent relative rounded-3xl p-4 justify-center  items-center w-1/3'>
            <button className='absolute top-0 left-0 bg-black rounded-lg h-8 w-8 hover:bg-red-600' onClick={() => setOpenModal(false)}>X</button>
            <div className='flex flex-col p-1 gap-3'>
              <p className='font-primary text-xl pt-4 p-2'>Continue with a magic link sent to your email</p>
              <div className='p-2 flex flex-row justify-center gap-2'>
                <input value={email} className="text-black rounded-lg p-2 font-accent" onChange={(e) => { console.log(e.target.value); setEmail(e.target.value) }} />
                <button className='btn capitalize font-accent hover:bg-primary hover:bg-yellow-400 hover:text-black' onClick={handleLogInWithOTP}>magic link</button>
              </div>
              <div className='font-primary self-center flex flex-row text-xl'> <span className='bg-black h-1 grow'/> <p>Or</p> <span className='bg-black h-1 grow'/></div>
              <div className='flex flex-col p-2 justify-center gap-2'>
                <button className='btn font-accent capitalize hover:text-black hover:bg-white ' onClick={() => handleLogInWithProvider('google')}> continue with <i className="fa-brands fa-google"/></button>
                <button className='btn font-accent capitalize hover:text-white hover:bg-blue-400 ' onClick={() => handleLogInWithProvider('facebook')}> continue with <i className="fa-brands fa-facebook"/></button>
                <button className='btn font-accent capitalize hover:text-white hover:bg-green-400 ' onClick={() => handleLogInWithProvider('azure')}> continue with <i className="fa-brands fa-microsoft"/></button>
              </div>
            </div>
          </div>
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

      {error && <p className="font-primary text-xl text-red-500 ">* {error} *</p>}

      {/* <SignUpButton /> */}
      <div className='flex flex-col justify-center'>
        <h3 className='text-4xl font-primary'>Get started by creating an account </h3>
        <div className='flex flex-row justify-center'>
          <label className='flex flex-row gap-2 capitalize font-accent m-1' >
            <button className='btn btn-primary font-accent' onClick={() => setOpenInput((prev) => !prev)}>{openInput ? 'cancel' : 'Sign Up'}</button>
            {openInput && <div className='flex flex-row gap-2'> <input className='text-black p-2 rounded-md' type='email' placeholder='enter your email' value={tempEmail} onChange={handleEmailChange} /> <button className='btn btn-primary' onClick={handleLogInWithOTP} disabled={loading} > send link </button></div>}
          </label>
        </div>
      </div>

      {/* <SignInButton /> */}
      <div className='flex flex-col justify-center'>
        <h3 className='text-4xl font-primary'>Or just sign into your account</h3>
        <div className='flex flex-row justify-center'>
          <label className=' capitalize font-accent m-1' >
            <button className='btn btn-primary font-accent' onClick={() => setOpenModal(true)} >Sign In</button>
          </label>
        </div>
      </div>

    </div>
  )
}

export default SignInPage
