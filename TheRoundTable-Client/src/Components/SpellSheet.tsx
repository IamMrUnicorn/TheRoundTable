interface SpellSheetI {
  spells: {
    cantrips: string[],
    lvl1: string[],
    lvl2: string[],
    lvl3: string[],
    lvl4: string[],
    lvl5: string[],
    lvl6: string[],
    lvl7: string[],
    lvl8: string[],
    lvl9: string[]
  }
}

const SpellModule = ({ spells, level, spellSlots }: { spells: string[], level: string, spellSlots: number }) => {
  // Create an array of checkboxes based on spellSlots
  const spellSlotCheckboxes = Array.from({ length: spellSlots }, (_, index) => (
    <input key={index} type='checkbox' className='m-0.5' />
  ));



  const lines = Array.from({ length: 15 }, (_, index) => index);


  return (
    <div className='flex flex-col m-3 flex-grow bg-yellow-100 rounded-3xl text-black px-5 pb-4 py-2'>
      <div className='flex flex-row py-2'>
        <div className='flex flex-col'>
          <p className='font-primary capitalize pb-4 text-3xl '>
            {level === 'cantrips' ? <p>Cantrips</p> : <p>Level <span className='text-7xl font-accent'>{level.slice(3)}</span></p>}
          </p>
          <p className='font-primary '>Prepared?</p>
        </div>
        {/* Conditionally render spell slot div */}
        {spellSlots > 0 && (
          <div className='flex flex-col mt-3 ml-8'>
            <p className='font-primary text-xl'> Spell Slots: </p>
            <div className='flex flex-row-reverse'>
              {spellSlotCheckboxes}
            </div>
          </div>
        )}
      </div>

      {lines.map((_, index) => (
        <div className='flex flex-row justify-between pl-5' key={index}>
          {spells[index] ? (
            <>
              <input type='checkbox' className='m-2' />
              <p className='underline font-accent capitalize'>{spells[index]}</p>
              <div>

                <div className='font-accent text-xs tooltip bg-yellow-100 px-2 pt-1' data-tip='1 Action'>
                  <i className="fa-solid fa-wand-sparkles" />
                  <i className="fa-solid fa-hourglass-half" />
                </div>
                <div className='font-accent text-xs tooltip bg-yellow-100 px-1 pt-1' data-tip='Requires Concentration'>
                  <i className="fa-solid fa-magnifying-glass" />
                </div>
              </div>
            </>
          ) : (
            <p className='underline  capitalize'>+____________________________________</p>
          )}
        </div>
      ))}
    </div>

  )
}

const spellSlotMapping = [0, 4, 3, 3, 3, 3, 2, 2, 1, 1];

export const SpellSheet = ({ spells }: SpellSheetI) => {

  return (
    <div className="rounded-3xl w-5/6 mx-auto flex flex-row flex-wrap gap-2">
      {Object.entries(spells).map((spell, index) => (
        <SpellModule level={spell[0]} spellSlots={spellSlotMapping[index]} spells={spell[1]} key={index} />
      ))}
    </div>
  )
}