
import { ProgressSpinner } from 'primereact/progressspinner';
        
export const LoadingPage = ({height}: {height?:number } ) => {

  return (
    <div className="flex flex-col justify-around gap-2 p-20">
      <p className='font-accent capitalize mx-auto'>hold on this may take a moment</p>
      {height ?  <ProgressSpinner className={`m-5 w-${height} h-${height} mx-auto`}/> : <ProgressSpinner className='m-5 w-96 h-96 mx-auto'/>}
      
    </div>
  )
}