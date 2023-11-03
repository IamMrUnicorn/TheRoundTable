const supabase = useContext(supabaseContext);

export const SignInWithPass = async () => {  
  try {
    let { data, error } = await supabase.auth.signInWithOtp({
      email: 'someone@email.com'
    })
  } catch (error) {
    console.log(error)
  }
  


}