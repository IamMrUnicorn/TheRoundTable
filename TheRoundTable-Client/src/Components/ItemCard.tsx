

export const ItemCard = ({type, rarity, description, name, dmg }) => {


  if (type === 'normal') (
    <div className={`
      ${rarity === 'common' ? 'bg-gray-300' : 
        rarity === 'rare' ? 'bg-blue-300' : 
        rarity === 'legendary' ? 'bg-purple-300' : 
        rarity === 'lore' ? 'bg-yellow-300' : 'bg-slate-300'}`}>
          <div>
            <p>{name} <span>{dmg}</span></p>
          </div>
          
          <div>
            <p>{description}</p>  
          </div>

    </div>
  ); else if (type === 'magical') (
    <div className={`
      ${rarity === 'common' ? 'bg-gray-300' : 
        rarity === 'rare' ? 'bg-blue-300' : 
        rarity === 'legendary' ? 'bg-purple-300' : 
        rarity === 'lore' ? 'bg-yellow-300' : 'bg-slate-300'}`}>
          <div>
            <p>{name} <span>{dmg}</span></p>
          </div>
          
          <div>
            <p>{description}</p>  
          </div>

    </div>
  ); else if (type === 'custom') (
    <div className={`
      ${rarity === 'common' ? 'bg-gray-300' : 
        rarity === 'rare' ? 'bg-blue-300' : 
        rarity === 'legendary' ? 'bg-purple-300' : 
        rarity === 'lore' ? 'bg-yellow-300' : 'bg-slate-300'}`}>
          <div>
            <p>{name} <span>{dmg}</span></p>
          </div>
          
          <div>
            <p>{description}</p>  
          </div>

    </div>
  ); else return (
    <div>
      ??? undefined card
    </div>
  )
}