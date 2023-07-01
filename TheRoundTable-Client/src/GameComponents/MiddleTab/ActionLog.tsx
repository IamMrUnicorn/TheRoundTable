import ActionLogMessage from './ActionLogMessage'
import {Message} from './ActionLogMessage'
interface ActionLogProps {
  Messages: Message[]
}
const ActionLog = ({Messages}:ActionLogProps) => {

  return (
    <div className="bg-primary max-h-[25vh] lg:max-h-[30vh] overflow-y-scroll hiddenScroll">
      {Messages.map((message, index) => (
        <ActionLogMessage message={message} key={index} />
      ))}
    </div>
  )
}

export default ActionLog