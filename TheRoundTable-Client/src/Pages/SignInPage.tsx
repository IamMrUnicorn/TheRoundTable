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


  const handleEmailChange = (e:any) => {
    setTempEmail(e.target.value)
    const value = e.target.value;
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      // If the input value matches the regex, update the state
      setEmail(value);
    } else {
      setError('please enter a valid email')
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
        ? (<div className='bg-primary absolute bg-opacity-40 h-screen w-screen z-30 '>
          <div className=' w-1/4 '>
            <button onClick={() => setOpenModal(false)}>X</button>
            <input value={email} onChange={setEmail}/>
            <button onClick={() => setOpenModal(false)}>magic email</button>
            <div className='flex flex-row gap-2'>
              <button onClick={() => handleLogInWithProvider('google')}>google</button>
              <button onClick={() => handleLogInWithProvider('facebook')}>facebook</button>
              <button onClick={() => handleLogInWithProvider('azure')}>microsoft</button>
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

        {error && <p className="font-primary text-xl ">{error}</p>}
      <div className='flex flex-col justify-center'>
        <h3 className='text-4xl font-primary'>Get started by creating an account </h3>

        <div className='flex flex-row justify-center'>
          <label className='btn btn-accent capitalize font-accent m-1' >
            {/* <SignUpButton /> */}
            <button className='btn primary font-accent' onClick={() => setOpenInput((prev)=>!prev)}>{openInput ? 'cancel' : 'Sign Up'}</button>
            {openInput && <div className='flex flex-row'> <input className='text-black' type='email' placeholder='enter your email' value={tempEmail} onChange={handleEmailChange}/> <button className='btn btn-primary' onClick={handleLogInWithOTP} disabled={loading} > send link </button></div>}
          </label>

        </div>

      </div>
      <div className='flex flex-col justify-center'>

        <h3 className='text-4xl font-primary'>Or just sign into your account</h3>

        <div className='flex flex-row justify-center'>
          <label className='btn btn-accent capitalize font-accent m-1' >
            {/* <SignInButton /> */}
            <button className='btn primary font-accent' onClick={() => setOpenModal(true)} >Sign In</button>
          </label>
        </div>
      </div>

    </div>
  )
}

export default SignInPage
