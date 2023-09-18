import ActionLogMessage from './ActionLogMessage'
import {Message} from './ActionLogMessage'
interface ActionLogProps {
  Messages: Message[]
}
const ActionLog = ({Messages}:ActionLogProps) => {

  return (
    <div className="bg-primary h-1/5 overflow-y-scroll hiddenScroll">
      {Messages.map((message, index) => (
        <ActionLogMessage message={message} key={index} index={index}/>
      ))}
    </div>
  )
}

export default ActionLog