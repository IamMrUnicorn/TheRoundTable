import { FC } from "react"

export interface Message {
  name:string,
  action:string,
  actionName?:string,
  target?:string,
  dialog?:string,
  rollMath?:string,
}

interface MessageProps {
  message:Message
}

const ActionLogMessage:FC<MessageProps> = ({message}) => {
  return (
    <div className="bg-neutral ActionLog-message flex flex-col">
      <div className="flex flex-row p-2">
        <p className="bg-warning m-1">{message.name}</p>
        <p className="bg-info m-1 "> {message.action} {message.action === 'ATTACKED' ? <i className ="fa-solid fa-gavel"></i> : message.action === 'CASTED' ? <i className ="fa-solid fa-wand-sparkles"></i> : message.action === 'TALKED' ? <i className ="fa-solid fa-head-side-cough"></i> : message.action === 'GAVE' ? <i className ="fa-solid fa-hand-holding-dollar"></i> : message.action === 'ROLLED' ? <i className ="fa-solid fa-dice-d20"></i> : null}</p>
        {message.actionName ? <p className="bg-error m-1 "> {message.action === 'ATTACKED' ? `using "${message.actionName}"` : message.actionName} </p> : null}
        <p className="bg-success m-1 ">{message.target ? '@' : null} {message.target}</p>
        <p className="bg- m-1 ">{message.dialog}</p>
      </div>

      {message.rollMath 
      ? <div className="flex flex-row pl-8">
          <p><i className ="fa-solid fa-dice-d20"></i> {message.rollMath}</p>
        </div> 
      : null}
    </div>
  )
}
export default ActionLogMessage

// create a better format so that

  // when a player attacks it should say 
    // [name] attacked [target] WITH [actionName] 

  // when a player casts a spell it should say
    // [name] casted [actionName] [@ target] 
  
  // when a player makes a roll it should say
    // [name] rolled for [actionName]
  
  // when a player talks it should say
    // [name] talked [@ target] [dialog]