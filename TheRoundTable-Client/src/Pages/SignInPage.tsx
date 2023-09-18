import { FC } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";



const SignInPage: FC = () => {

  return (
    <div className="h-[100vh] flex flex-col text-white items-center justify-evenly bg-black ">
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
            <SignUpButton />
          </label>

        </div>

      </div>
      <div className='flex flex-col justify-center'>

        <h3 className='text-3xl font-primary'>Or just sign into your account</h3>

        <div className='flex flex-row justify-center'>
          <label className='btn btn-accent capitalize font-accent m-1' >
            <SignInButton />
          </label>
        </div>
      </div>

    </div>
  )
}

export default SignInPage
