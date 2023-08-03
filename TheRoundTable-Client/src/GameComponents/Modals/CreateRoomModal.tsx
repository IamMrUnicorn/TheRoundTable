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
    const formData = _data;

    const RoomInfo = {
      dm_id: formData.DMcheck === true ? user?.id : null,
      name: formData.name
    }
    console.log(RoomInfo)

    const { data, error } = await supabase
    .from ('parties')
    .insert([RoomInfo])
    if (error) {
      console.log(error)
    } else {
      console.log(data)
      window.location.href = `/rooms/${formData.name}`
    }
  }
  return (
    <>
      <input type="checkbox" id="createRoom_modal" className="modal-toggle" />
      <div className="modal">
        <form className="modal-box bg-info flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <label>  are you the DM?:   <Controller name="DMcheck" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /> </label>
        <label>  enter your party name / campaign name:  <Controller name="name" control={control} defaultValue="" render={({ field }) => <input className='text-black' type="text" {...field} />} />  {errors.name && <p className='text-red-500'>Character name is required</p>} </label>

          <div className="flex flex-row m-3 justify-end">
            <input type='submit' className="btn" value='create room'/>
            <label htmlFor="createRoom_modal" className="btn" onClick={() => {setPopup(false)}}>Cancel</label>
          </div>
        
        </form>
      </div>
    </>
  )
}
export default CreateRoomModal

