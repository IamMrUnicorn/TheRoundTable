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

const ActionLogMessage:FC<MessageProps> = ({message, index}) => {
  return (
    <div className={` text-stone-800 ActionLog-message flex flex-col ${index % 2 === 0  ? 'bg-neutral bg-opacity-95' : 'bg-neutral bg-opacity-75'}`}>
      <div className="flex flex-row p-2">
        <p className="bg-warning rounded m-1 p-0.5 h-min font2 capitalize">{message.name}</p>
        <p className="bg-success rounded m-1 p-0.5 h-min font2 capitalize whitespace-nowrap"> {message.action} {message.action === 'ATTACKED' ? <i className ="fa-solid fa-gavel"></i> : message.action === 'CASTED' ? <i className ="fa-solid fa-wand-sparkles"></i> : message.action === 'TALKED' ? <i className ="fa-solid fa-head-side-cough"></i> : message.action === 'GAVE' ? <i className ="fa-solid fa-hand-holding-dollar"></i> : message.action === 'ROLLED' ? <i className ="fa-solid fa-dice-d20"></i> : null}</p>
        {message.actionName ? <p className="bg-error rounded m-1 p-0.5 font2 capitalize whitespace-nowrap"> {message.action === 'ATTACKED' ? `using "${message.actionName}"` : message.actionName} </p> : null}
        <p className="bg-info rounded m-1 p-0.5 font2 capitalize h-min whitespace-nowrap">{message.target ? '@' : null} {message.target}</p>
      </div>

      <div>

        <p className=" m-1 pl-8 font2">{message.dialog}</p>

      {message.rollMath 
      ? <div className="flex flex-row pl-8 font2 capitalize">
          <p><i className ="fa-solid fa-dice-d20"></i> {message.rollMath}</p>
        </div> 
      : null}
      </div>
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