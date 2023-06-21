import ActionLogMessage from './ActionLogMessage'
import {Message} from './ActionLogMessage'
interface ActionLogProps {
  Messages: Message[]
}
const ActionLog = ({Messages}:ActionLogProps) => {

  return (
    <div className="bg-primary overflow-y-scroll">
      {Messages.map((message, index) => (
        <ActionLogMessage message={message} key={index} />
      ))}
    </div>
  )
}

export default ActionLog