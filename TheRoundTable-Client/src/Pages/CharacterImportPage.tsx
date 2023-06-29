import React, { useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Chips } from "primereact/chips";

interface CharacterImportProps {
  username: string | null,
}
const schema = yup.object().shape({
  name: yup.string().required('Character name is required'),
  race: yup.string().required('Character race is required'),
  background: yup.string().required('Character background is required'),
  class: yup.string().required('Character class is required'),
  subclass: yup.string().required('Character subclass is required'),
  level: yup.number().max(30, 'Level can\'t be over 30').required('Level is required'),
  alignment: yup.string().matches(/(lawful|neutral|chaotic) (good|neutral|evil)/, 'Alignment must be one of lawful, neutral, chaotic combined with one of good, neutral, evil'),
  strength: yup.number().max(30, 'Strength can\'t be over 30'),
  dexterity: yup.number().max(30, 'Dexterity can\'t be over 30'),
  constitution: yup.number().max(30, 'Constitution can\'t be over 30'),
  intelligence: yup.number().max(30, 'Intelligence can\'t be over 30'),
  wisdom: yup.number().max(30, 'Wisdom can\'t be over 30'),
  charisma: yup.number().max(30, 'Charisma can\'t be over 30'),
  maxHP: yup.number().max(9999, 'maxHP can\'t be over 9999'),
  AC: yup.number().max(60, 'AC can\'t be over 60'),
  proficiency: yup.number().max(10, 'proficiency can\'t be over 10'),
  initiative: yup.number().max(10, 'initiative can\'t be over 10'),
  speed: yup.number().max(999, 'speed can\'t be over 999'),
  spellDC: yup.number().max(60, 'spellDC can\'t be over 60'),
  hitDice: yup.string().required('hit dice is required'),
  strengthProficient: yup.boolean(),
  dexterityProficient: yup.boolean(),
  constitutionProficient: yup.boolean(),
  intelligenceProficient: yup.boolean(),
  wisdomProficient: yup.boolean(),
  charismaProficient: yup.boolean(),
  athleticsProficient: yup.boolean(),
  acrobaticsProficient: yup.boolean(),
  sleightOfHandProficient: yup.boolean(),
  intimidationProficient: yup.boolean(),
  performanceProficient: yup.boolean(),
  investigationProficient: yup.boolean(),
  animalHandlingProficient: yup.boolean(),
  natureProficient: yup.boolean(),
  religionProficient: yup.boolean(),
  historyProficient: yup.boolean(),
  insightProficient: yup.boolean(),
  medicineProficient: yup.boolean(),
  perceptionProficient: yup.boolean(),
  survivalProficient: yup.boolean(),
  deceptionProficient: yup.boolean(),
  stealthProficient: yup.boolean(),
  arcanaProficient: yup.boolean(),
  persuasionProficient: yup.boolean(),
  copper: yup.number().max(60, 'copper can\'t be over 60'),
  silver: yup.number().max(60, 'silver can\'t be over 60'),
  gold: yup.number().max(60, 'gold can\'t be over 60'),
  platinum: yup.number().max(60, 'platinum can\'t be over 60'),
  feats: yup.array(),
  inventory: yup.array(),
  cantrips: yup.array(),
  lvl1: yup.array(),
  lvl2: yup.array(),
  lvl3: yup.array(),
  lvl4: yup.array(),
  lvl5: yup.array(),
  lvl6: yup.array(),
  lvl7: yup.array(),
  lvl8: yup.array(),
  lvl9: yup.array(),
  heavy: yup.array(),
  light: yup.array(),
  reach: yup.array(),
  range: yup.array(),
  thrown: yup.array(),
  loading: yup.array(),
  finesse: yup.array(),
  special: yup.array(),
  versatile: yup.array(),
  twoHanded: yup.array(),
  magicalWeapons: yup.array(),
});


interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  maxHP: number;
  AC: number;
  proficiency: number;
  initiative: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  spellDC: number;
  feats: string[];
  strengthProficient: boolean;
  dexterityProficient: boolean;
  constitutionProficient: boolean;
  intelligenceProficient: boolean;
  wisdomProficient: boolean;
  charismaProficient: boolean;
  athleticsProficient: boolean;
  acrobaticsProficient: boolean;
  sleightOfHandProficient: boolean;
  intimidationProficient: boolean;
  performanceProficient: boolean;
  investigationProficient: boolean;
  animalHandlingProficient: boolean;
  natureProficient: boolean;
  religionProficient: boolean;
  historyProficient: boolean;
  insightProficient: boolean;
  medicineProficient: boolean;
  perceptionProficient: boolean;
  survivalProficient: boolean;
  deceptionProficient: boolean;
  stealthProficient: boolean;
  arcanaProficient: boolean;
  persuasionProficient: boolean;
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
  hitDice: string;
  inventory: string[];
  cantrips: string[];
  lvl1: string[];
  lvl2: string[];
  lvl3: string[];
  lvl4: string[];
  lvl5: string[];
  lvl6: string[];
  lvl7: string[];
  lvl8: string[];
  lvl9: string[];
  heavy: string[];
  light: string[];
  reach: string[];
  range: string[];
  thrown: string[];
  loading: string[];
  finesse: string[];
  special: string[];
  versatile: string[];
  twoHanded: string[];
  magicalWeapons: string[];
}

const CharacterForm = ({ username }: CharacterImportProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [submitted, setSubmitted] = useState(false)
  const [confirmation, setConfirmation] = useState(false)

  const onSubmit = (_data: unknown, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (Object.keys(errors).length === 0) {
      setConfirmation(true);
    }
  };

  const onConfirm = async (data: unknown) => {
    setSubmitted(true)
    const formData = data as CharacterFormData
    console.log(formData);
    axios.post(`http://localhost:3000/characters/${username}/import`, formData)
      .then((response) => {
        console.log(response)
      })
      .catch((err) => {
        console.log('err from server -> ', err)
      })
  };

  const customChip = (item:string) => {
    return (
      <div className='bg-secondary'>
        <span>{item}</span>
      </div>
    );
  };

  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
      <p className='bg-secondary rounded-full w-max m-2 p-3 text-neutral self-center'>enter everything as it appears on your character sheet</p>
      <div className='flex flex-row gap-1 justify-center'>

        <div className='flex flex-col gap-1 w-min items-end '>
          <p className='self-center'>character name</p>
          <label>  Name:  <Controller name="name" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} />  {errors.name && <p>Character name is required</p>} </label>
          <label>  Race:  <Controller name="race" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.race && <p>Character race is required</p>} </label>
          <label>  Class:  <Controller name="class" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.class && <p>Character class is required</p>} </label>
          <label>  Subclass:  <Controller name="subclass" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.subclass && <p>Character subclass is required</p>} </label>
          <label>  Level:  <Controller name="level" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.level && <p>Level is required and can't be over 30</p>} </label>
          <label>  Background:  <Controller name="background" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.background && <p>Character background is required</p>} </label>
          <label>  Alignment:  <Controller name="alignment" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.alignment && <p>Alignment must be one of lawful, neutral, chaotic combined with one of good, neutral, evil</p>} </label>
          <label>  hit Dice:  <Controller name="hitDice" control={control} defaultValue="" render={({ field }) => <input type="text" {...field} />} /> {errors.hitDice && <p> Character hit dice are required </p>} </label>
        </div>
        <div className='flex flex-col items-end w-min flex-wrap gap-1'>
          <p className='self-center'>character details & skills</p>
          <label>   MaxHP:   <Controller name="maxHP" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.maxHP && <p>maxHP can't be over 9999</p>} </label>
          <label>   AC:   <Controller name="AC" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.AC && <p>AC can't be over 60</p>} </label>
          <label>   Proficiency bonus:   <Controller name="proficiency" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.proficiency && <p>Proficiency bonus can't be over 10</p>} </label>
          <label>   Initiative:   <Controller name="initiative" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.initiative && <p>Initiative can't be over 10</p>} </label>
          <label>   Speed:   <Controller name="speed" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.speed && <p>Speed can't be over 999</p>} </label>
          <label>   Strength:   <Controller name="strength" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.strength && <p>Strength can't be over 30</p>} </label>
          <label>   Dexterity:   <Controller name="dexterity" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.dexterity && <p>Dexterity can't be over 30</p>} </label>
          <label>   Constitution:   <Controller name="constitution" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.constitution && <p>Constitution can't be over 30</p>} </label>
          <label>   Intelligence:   <Controller name="intelligence" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.intelligence && <p>Intelligence can't be over 30</p>} </label>
          <label>   Wisdom:   <Controller name="wisdom" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.wisdom && <p>Wisdom can't be over 30</p>} </label>
          <label>   Charisma:   <Controller name="charisma" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.charisma && <p>Charisma can't be over 30</p>} </label>
          <label>   SpellDC:   <Controller name="spellDC" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /> {errors.spellDC && <p>spellDC can't be over 60</p>} </label>
          <label>   Feats: <Controller name="feats" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-end w-min flex-wrap gap-1'>
          <p className='self-center'>proficiencies</p>
          <label>  strength:   <Controller name="strengthProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /> </label>
          <label>  dexterity:   <Controller name="dexterityProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /> </label>
          <label>  constitution:  <Controller name="constitutionProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  intelligence:  <Controller name="intelligenceProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  wisdom:  <Controller name="wisdomProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  charisma:  <Controller name="charismaProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  athletics:  <Controller name="athleticsProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  acrobatics:  <Controller name="acrobaticsProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  sleightOfHand:  <Controller name="sleightOfHandProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  intimidation:  <Controller name="intimidationProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  performance:  <Controller name="performanceProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  investigation:  <Controller name="investigationProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  animalHandling:   <Controller name="animalHandlingProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /> </label>
          <label>  nature:   <Controller name="natureProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /> </label>
          <label>  religion:  <Controller name="religionProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  history:  <Controller name="historyProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  insight:  <Controller name="insightProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  medicine:  <Controller name="medicineProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  perception:  <Controller name="perceptionProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  survival:  <Controller name="survivalProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  deception:  <Controller name="deceptionProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  stealth:  <Controller name="stealthProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  arcana:  <Controller name="arcanaProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
          <label>  persuasion:  <Controller name="persuasionProficient" control={control} defaultValue={false} render={({ field: { ref, value, ...restField } }) => <input type="checkbox" {...restField} ref={ref} checked={!!value} />} /></label>
        </div>
        <div className='flex flex-col items-end w-min flex-wrap gap-1'>
          <p className='self-center'>inventory</p>
          <label>  copper pieces:  <Controller name="copper" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /></label>
          <label>  silver pieces:  <Controller name="silver" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /></label>
          <label>  gold pieces:  <Controller name="gold" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /></label>
          <label>  platinum pieces:  <Controller name="platinum" control={control} defaultValue={0} render={({ field }) => <input type="number" {...field} />} /></label>
          <label>  inventory: <Controller name="inventory" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-end w-min flex-wrap gap-1'>
          <p className='self-center'>spells</p>
          <label> Cantrips: <Controller name="cantrips" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl1: <Controller name="lvl1" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl2: <Controller name="lvl2" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl3: <Controller name="lvl3" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl4: <Controller name="lvl4" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl5: <Controller name="lvl5" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl6: <Controller name="lvl6" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl7: <Controller name="lvl7" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl8: <Controller name="lvl8" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl9: <Controller name="lvl9" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>



        <div className='flex flex-col items-end flex-wrap gap-1'>
          <p className='self-center'>weapons</p>
          <label> heavy: <Controller name="heavy" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> light: <Controller name="light" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> reach: <Controller name="reach" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> range: <Controller name="range" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> thrown: <Controller name="thrown" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> loading: <Controller name="loading" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> finesse: <Controller name="finesse" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> special: <Controller name="special" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> versatile: <Controller name="versatile" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> twoHanded: <Controller name="twoHanded" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> magicalWeapons: <Controller name="magicalWeapons" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>

      </div>
      {submitted ? null : (<div className='flex flex-row justify-center'>
        {!confirmation && <button className='btn' type="submit">Submit for Validation</button>}
        {confirmation && <button className='btn' type="button" onClick={handleSubmit(onConfirm)}>Confirm Submission</button>}
      </div>)}
    </form>
  );
};

export default CharacterForm;

// modifier should be mathed but player can edit bc of magical item
// hit dice
