import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {useForm, Controller} from 'react-hook-form'
import { useUser } from '@clerk/clerk-react'
import { useContext } from 'react'
import { supabaseContext } from '../../supabase'



interface CreateRoomModalProps {
  setPopup: (arg0:boolean) => void,
}
interface formData {
  DMcheck: boolean,
  name:string
}


const schema = yup.object().shape({
  DMcheck: yup.boolean(),
  name: yup.string().required('party / campaign name is required')
})

const CreateRoomModal = ({setPopup}:CreateRoomModalProps) => {
  
  const supabase = useContext(supabaseContext)
  const { user } = useUser()
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (_data:formData) => {

    const RoomInfo = {
      DM_clerk_id: _data.DMcheck === true ? user?.id : null,
      name: _data.name.toLowerCase(),
      creator_clerk_id: user?.id,
      setup: false
    }
    console.log(RoomInfo)

    const { data, error } = await supabase
    .from ('parties')
    .insert([RoomInfo])
    if (error) {
      console.log(error)
    } else {
      console.log(data)
      window.location.href = `/waiting-room/${_data.name}`
    }

  }
  return (
    <>
      <input type="checkbox" id="createRoom_modal" className="modal-toggle" />
      <div className="modal">
        <form className="modal-box bg-info flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <label className='mx-auto font-primary'> Are you the DM?:   
          <Controller name="DMcheck" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" className='m-2' {...restField} ref={ref} checked={!!value} />} /> 
        </label>
        <label className='mx-auto font-primary'>  Enter your Party / Campaign name: 
        <br/>
          <Controller name="name" control={control} defaultValue="" render={({ field }) => <input className='text-black ml-6 p-2 font-accent rounded-lg m-1' type="text" {...field} />} />  {errors.name && <p className='text-red-500 pl-7'>party/campaign name is required</p>} 
        </label>

          <div className="flex flex-row m-3 mx-auto ">
            <input type='submit' className="btn mx-2 capitalize font-accent" value='create room'/>
            <label htmlFor="createRoom_modal" className="btn mx-2 capitalize font-accent" onClick={() => {setPopup(false)}}>Cancel</label>
          </div>
        
        </form>
      </div>
    </>
  )
}
export default CreateRoomModal

