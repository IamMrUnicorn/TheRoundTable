import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

interface CharacterImportProps{
  username:string,
}

const CharacterForm = ({ username }:CharacterImportProps) => {
  const { handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    axios.post(`http://localhost:5174/characters/${username}/import`, data)
      .then((response) => {
        console.log(response)
      })
      .catch((err) => {
        console.log('err from server -> ', err)
      })
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-row'>
        <div className='flex flex-col items-end'>
          <p>character details & skills</p>
          <label>
            Name:
            <Controller name="name" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} />
          </label>
          {/* Repeat this pattern for the rest of your form fields... */}

        </div>

        <div className='flex flex-col items-end'>
          <p>proficiencies</p>
          <label>
            strength:
            <Controller name="strengthChecked" control={control} defaultValue={false} render={({ field }) => <input type="checkbox" {...field} />} />
          </label>
          {/* Repeat this pattern for the rest of your checkboxes... */}
        </div>

        <div className='flex flex-col items-end'>
          <p>inventory</p>
          <label>
            everything you own:
            <Controller name="inventory" control={control} defaultValue="" render={({ field }) => <textarea {...field} />} />
          </label>
          <button className='btn' type="submit">Submit</button>
        </div>
      </div>
    </form>
  );
};

export default CharacterForm;


/**
 * import { useState } from 'react';
import axios from 'axios';

interface CharacterImportProps{
  username:string,
}

const CharacterForm = ({ username }:CharacterImportProps) => {
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    subclass: '',
    level: 0,
    maxHP: 0,
    AC: 0,
    proficiency: 0,
    initiative: 0,
    speed: 0,
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
    spellDC: 0,
    strengthChecked: false,
    dexterityChecked: false,
    constitutionChecked: false,
    intelligenceChecked: false,
    wisdomChecked: false,
    charismaChecked: false,
    athleticsChecked: false,
    acrobaticsChecked: false,
    sleightOfHandChecked: false,
    stealthChecked: false,
    arcanaChecked: false,
    historyChecked: false,
    investigationChecked: false,
    natureChecked: false,
    religionChecked: false,
    animalHandlingChecked: false,
    insightChecked: false,
    medicineChecked: false,
    perceptionChecked: false,
    survivalChecked: false,
    deceptionChecked: false,
    intimidationChecked: false,
    performanceChecked: false,
    persuasionChecked: false,
    inventory: '',
    cantrips: '',
    lvl1: '',
    lvl2: '',
    lvl3: '',
    lvl4: '',
    lvl5: '',
    lvl6: '',
    lvl7: '',
    lvl8: '',
    lvl9: '',
    heavy: '',
    light: '',
    reach: '',
    thrown: '',
    loading: '',
    range: '',
    finesse: '',
    special: '',
    versatile: '',
    twoHanded: '',
    magicalWeapons: ''
  });
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can perform any necessary actions with the form data here
    console.log(formData);
    axios.post(`http://localhost:5174/characters/${username}/import`, formData)
      .then((response) => {
        console.log(response)
      })
      .catch((err) => {
        console.log('err from server -> ', err)
      })
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-row'>

        <div className='flex flex-col items-end'>
          <p>character details & skills</p>
          <label>
            Name:
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>
            race:
            <input type="text" name="race" value={formData.race} onChange={handleChange} />
          </label>
          <label>
            class:
            <input type="text" name="class" value={formData.class} onChange={handleChange} />
          </label>
          <label>
            subclass:
            <input type="text" name="subclass" value={formData.subclass} onChange={handleChange} />
          </label>
          <label>
            level:
            <input type="number" name="level" value={formData.level} onChange={handleChange} />
          </label>
          <label>
            maxHP:
            <input type="number" name="maxHP" value={formData.maxHP} onChange={handleChange} />
          </label>
          <label>
            AC:
            <input type="number" name="AC" value={formData.AC} onChange={handleChange} />
          </label>
          <label>
            proficiency bonus:
            <input type="number" name="proficiency" value={formData.proficiency} onChange={handleChange} />
          </label>
          <label>
            initiative:
            <input type="number" name="initiative" value={formData.initiative} onChange={handleChange} />
          </label>
          <label>
            movement speed:
            <input type="number" name="speed" value={formData.speed} onChange={handleChange} />
          </label>
          <label>
            strength:
            <input type="number" name="strength" value={formData.strength} onChange={handleChange} />
          </label>
          <label>
            dexterity:
            <input type="number" name="dexterity" value={formData.dexterity} onChange={handleChange} />
          </label>
          <label>
            constitution:
            <input type="number" name="constitution" value={formData.constitution} onChange={handleChange} />
          </label>
          <label>
            intelligence:
            <input type="number" name="intelligence" value={formData.intelligence} onChange={handleChange} />
          </label>
          <label>
            wisdom:
            <input type="number" name="wisdom" value={formData.wisdom} onChange={handleChange} />
          </label>
          <label>
            charisma:
            <input type="number" name="charisma" value={formData.charisma} onChange={handleChange} />
          </label>
          <label>
            spellDC:
            <input type="number" name="spellDC" value={formData.spellDC} onChange={handleChange} />
          </label>
        </div>

        <div className='flex flex-col items-end'>
          <p>proficiencies</p>
          <label>
            strength:
            <input type="checkbox" name="strengthChecked" checked={formData.strengthChecked} onChange={handleChange} />
          </label>
          <label>
            dexterity:
            <input type="checkbox" name="dexterityChecked" checked={formData.dexterityChecked} onChange={handleChange} />
          </label>
          <label>
            constitution:
            <input type="checkbox" name="constitutionChecked" checked={formData.constitutionChecked} onChange={handleChange} />
          </label>
          <label>
            intelligence:
            <input type="checkbox" name="intelligenceChecked" checked={formData.intelligenceChecked} onChange={handleChange} />
          </label>
          <label>
            wisdom:
            <input type="checkbox" name="wisdomChecked" checked={formData.wisdomChecked} onChange={handleChange} />
          </label>
          <label>
            charisma:
            <input type="checkbox" name="charismaChecked" checked={formData.charismaChecked} onChange={handleChange} />
          </label>
          <label>
            athletics:
            <input type="checkbox" name="athleticsChecked" checked={formData.athleticsChecked} onChange={handleChange} />
          </label>
          <label>
            acrobatics:
            <input type="checkbox" name="acrobaticsChecked" checked={formData.acrobaticsChecked} onChange={handleChange} />
          </label>
          <label>
            sleightOfHand:
            <input type="checkbox" name="sleightOfHandChecked" checked={formData.sleightOfHandChecked} onChange={handleChange} />
          </label>
          <label>
            stealth:
            <input type="checkbox" name="stealthChecked" checked={formData.stealthChecked} onChange={handleChange} />
          </label>
          <label>
            arcana:
            <input type="checkbox" name="arcanaChecked" checked={formData.arcanaChecked} onChange={handleChange} />
          </label>
          <label>
            history:
            <input type="checkbox" name="historyChecked" checked={formData.historyChecked} onChange={handleChange} />
          </label>
          <label>
            investigation:
            <input type="checkbox" name="investigationChecked" checked={formData.investigationChecked} onChange={handleChange} />
          </label>
          <label>
            nature:
            <input type="checkbox" name="natureChecked" checked={formData.natureChecked} onChange={handleChange} />
          </label>
          <label>
            religion:
            <input type="checkbox" name="religionChecked" checked={formData.religionChecked} onChange={handleChange} />
          </label>
          <label>
            animalHandling:
            <input type="checkbox" name="animalHandlingChecked" checked={formData.animalHandlingChecked} onChange={handleChange} />
          </label>
          <label>
            insight:
            <input type="checkbox" name="insightChecked" checked={formData.insightChecked} onChange={handleChange} />
          </label>
          <label>
            medicine:
            <input type="checkbox" name="medicineChecked" checked={formData.medicineChecked} onChange={handleChange} />
          </label>
          <label>
            perception:
            <input type="checkbox" name="perceptionChecked" checked={formData.perceptionChecked} onChange={handleChange} />
          </label>
          <label>
            survival:
            <input type="checkbox" name="survivalChecked" checked={formData.survivalChecked} onChange={handleChange} />
          </label>
          <label>
            deception:
            <input type="checkbox" name="deceptionChecked" checked={formData.deceptionChecked} onChange={handleChange} />
          </label>
          <label>
            intimidation:
            <input type="checkbox" name="intimidationChecked" checked={formData.intimidationChecked} onChange={handleChange} />
          </label>
          <label>
            performance:
            <input type="checkbox" name="performanceChecked" checked={formData.performanceChecked} onChange={handleChange} />
          </label>
          <label>
            persuasion:
            <input type="checkbox" name="persuasionChecked" checked={formData.persuasionChecked} onChange={handleChange} />
          </label>
        </div>

        <div className='flex flex-col items-end'>
          <p>inventory</p>
          <label>
            everything you own:
            <textarea name="items" value={formData.inventory} onChange={handleChange} />
          </label>

          <p>weapons</p>
          <label>
            heavy:
            <input type="text" name="heavy" value={formData.heavy} onChange={handleChange} />
          </label>

          <label>
            light:
            <input type="text" name="light" value={formData.light} onChange={handleChange} />
          </label>

          <label>
            reach:
            <input type="text" name="reach" value={formData.reach} onChange={handleChange} />
          </label>

          <label>
            thrown:
            <input type="text" name="thrown" value={formData.thrown} onChange={handleChange} />
          </label>

          <label>
            loading:
            <input type="text" name="loading" value={formData.loading} onChange={handleChange} />
          </label>

          <label>
            range:
            <input type="text" name="range" value={formData.range} onChange={handleChange} />
          </label>

          <label>
            finesse:
            <input type="text" name="finesse" value={formData.finesse} onChange={handleChange} />
          </label>

          <label>
            special:
            <input type="text" name="special" value={formData.special} onChange={handleChange} />
          </label>

          <label>
            versatile:
            <input type="text" name="versatile" value={formData.versatile} onChange={handleChange} />
          </label>

          <label>
            twoHanded:
            <input type="text" name="twoHanded" value={formData.twoHanded} onChange={handleChange} />
          </label>

          <label>
            Magical weapons:
            <input type="text" name="magicalWeapons" value={formData.magicalWeapons} onChange={handleChange} />
          </label>


          <p>spells</p>
          <label>
            cantrips:
            <input type="text" name="cantrips" value={formData.cantrips} onChange={handleChange} />
          </label>

          <label>
            lvl1:
            <input type="text" name="lvl1" value={formData.lvl1} onChange={handleChange} />
          </label>

          <label>
            lvl2:
            <input type="text" name="lvl2" value={formData.lvl2} onChange={handleChange} />
          </label>

          <label>
            lvl3:
            <input type="text" name="lvl3" value={formData.lvl3} onChange={handleChange} />
          </label>

          <label>
            lvl4:
            <input type="text" name="lvl4" value={formData.lvl4} onChange={handleChange} />
          </label>

          <label>
            lvl5:
            <input type="text" name="lvl5" value={formData.lvl5} onChange={handleChange} />
          </label>

          <label>
            lvl6:
            <input type="text" name="lvl6" value={formData.lvl6} onChange={handleChange} />
          </label>

          <label>
            lvl7:
            <input type="text" name="lvl7" value={formData.lvl7} onChange={handleChange} />
          </label>

          <label>
            lvl8:
            <input type="text" name="lvl8" value={formData.lvl8} onChange={handleChange} />
          </label>

          <label>
            lvl9:
            <input type="text" name="lvl9" value={formData.lvl9} onChange={handleChange} />
          </label>


          <button className='btn' type="submit">Submit</button>

        </div>
      </div>
    </form>
  );
};

export default CharacterForm;
 */