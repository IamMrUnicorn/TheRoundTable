import React, { useContext, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Chips } from "primereact/chips";
import { supabaseContext } from '../supabase';

interface CharacterImportProps {
  user_id: string
}
const schema = yup.object().shape({
  name: yup.string().required('Character name is required'),
  race: yup.array().required('Atleast 1 Character race is required'),
  background: yup.string().required('Character background is required'),
  class: yup.array().required('Atleast 1 Character class is required'),
  subclass: yup.array().required('Atleast 1 Character subclass is required'),
  level: yup.number().min(1, 'Level can\'t be under 1').max(20, 'Level can\'t be over 20').required('Level is required'),
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
  hitDice: yup.string().matches(/^(?:[1-9]|[12][0-9]|30)\s[dD](4|6|8|10|12|20)$/).required('hit dice must be "number(1-30) D[4|6|8|10|12|20]"'),
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
  copper: yup.number(),
  silver: yup.number(),
  gold: yup.number(),
  platinum: yup.number(),
  languages: yup.array(),
  proficiencies: yup.array(),
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
  race: string[];
  class: string[];
  subclass: string[];
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
  languages: string[];
  feats: string[];
  proficiencies: string[];
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

const CharacterForm = ({ user_id }: CharacterImportProps) => {
  const supabase = useContext(supabaseContext)
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

  const onConfirm = async (_data: unknown) => {
    setSubmitted(true)
    const formData = _data as CharacterFormData
    console.log(formData);
    const inventory = JSON.stringify({
      copper: formData.copper,
      silver: formData.silver,
      gold: formData.gold,
      platinum: formData.platinum,
      inventory: formData.inventory
    })
    const spells = JSON.stringify({
      cantrips: formData.cantrips,
      lvl1: formData.lvl1,
      lvl2: formData.lvl2,
      lvl3: formData.lvl3,
      lvl4: formData.lvl4,
      lvl5: formData.lvl5,
      lvl6: formData.lvl6,
      lvl7: formData.lvl7,
      lvl8: formData.lvl8,
      lvl9: formData.lvl9,
    })
    const weapons = JSON.stringify({
      heavy: formData.heavy,
      light: formData.light,
      reach: formData.reach,
      range: formData.range,
      thrown: formData.thrown,
      loading: formData.loading,
      finesse: formData.finesse,
      special: formData.special,
      versatile: formData.versatile,
      twoHanded: formData.twoHanded,
      magicalWeapons: formData.magicalWeapons
    })

    const DBsubmission = {
      'character': {
        clerk_user_id: user_id,
        party_id: null,
        name: formData.name,
        image_url: null,
        race: JSON.stringify(formData.race),
        class: JSON.stringify(formData.class),
        subclass: JSON.stringify(formData.subclass),
        background: formData.background,
        alignment: formData.alignment,
        level: formData.level,
        hitdice: formData.hitDice,
        languages: JSON.stringify(formData.languages),
        proficiencies: JSON.stringify(formData.proficiencies)
      },
      'stats': {
        character_id: '',
        status: 'healthy',
        currenthp: formData.maxHP,
        maxhp: formData.maxHP,
        ac: formData.AC,
        proficiency: formData.proficiency,
        initiative: formData.initiative,
        speed: formData.speed,
        strength: formData.strength,
        dexterity: formData.dexterity,
        constitution: formData.constitution,
        intelligence: formData.intelligence,
        wisdom: formData.wisdom,
        charisma: formData.charisma,
        spell_dc: formData.spellDC,
        feats: JSON.stringify(formData.feats),
      },
      'proficiency': {
        character_id: '',
        strength: formData.strengthProficient,
        dexterity: formData.dexterityProficient,
        constitution: formData.constitutionProficient,
        intelligence: formData.intelligenceProficient,
        wisdom: formData.wisdomProficient,
        charisma: formData.charismaProficient,
        athletics: formData.athleticsProficient,
        acrobatics: formData.acrobaticsProficient,
        sleightofhand: formData.sleightOfHandProficient,
        stealth: formData.stealthProficient,
        arcana: formData.arcanaProficient,
        history: formData.historyProficient,
        investigation: formData.investigationProficient,
        nature: formData.natureProficient,
        religion: formData.religionProficient,
        animalhandling: formData.animalHandlingProficient,
        insight: formData.insightProficient,
        medicine: formData.medicineProficient,
        perception: formData.perceptionProficient,
        survival: formData.survivalProficient,
        deception: formData.deceptionProficient,
        intimidation: formData.intimidationProficient,
        performance: formData.performanceProficient,
        persuasion: formData.persuasionProficient,
      },
      'inventory': {
        character_id: '',
        spells: spells,
        weapons: weapons,
        inventory: inventory
      },
    }
    const character = JSON.stringify(DBsubmission)

    localStorage.setItem('Main_character', character)

    console.log(DBsubmission.character)
    const { data, error } = await supabase
      .from('characters')
      .insert(DBsubmission.character)
      .select();
    if (error) {
      console.log(error)
    } else {
      console.log(data[0])
      const characterId = data[0].id;
      DBsubmission.stats.character_id = characterId;
      DBsubmission.proficiency.character_id = characterId;
      DBsubmission.inventory.character_id = characterId;
      const { error } = await supabase
        .from('character_stats')
        .insert(DBsubmission.stats);
      if (error) {
        console.log(error)
      } else {
        const { error } = await supabase
          .from('character_proficiency')
          .insert(DBsubmission.proficiency);
        if (error) {
          console.log(error)
        } else {
          const { error } = await supabase
            .from('character_inventory')
            .insert(DBsubmission.inventory)
          if (error) {
            console.log(error)
          }
        }
      }
    }
  };

  const customChip = (item: string) => {
    return (
      <div className=' rounded-lg text-center w-min whitespace-nowrap p-1'>
        <span>{item}</span>
      </div>
    );
  };

  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
      <p className='bg-primary rounded-full lg:w-max m-2 p-3 text-neutral self-center'>enter everything as it appears on your character sheet</p>
      <div className='flex flex-col lg:flex-row gap-1 items-center lg:items-baseline lg:justify-center'>

        <div className='flex flex-col gap-1 w-min items-end '>
          <p className='self-center'>character identity</p>
          <label>  Name:  <Controller name="name" control={control} defaultValue="" render={({ field }) => <input className='text-black' type="text" {...field} />} />  {errors.name && <p className='text-red-500'>Character name is required</p>} </label>
          <label>  Race:  <Controller name="race" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> {errors.race && <p className='text-red-500'>At least 1 race is required</p>} </label>
          <label>  Class:  <Controller name="class" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} />{errors.class && <p className='text-red-500'>At least 1 class is required</p>} </label>
          <label>  Subclass:  <Controller name="subclass" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} />{errors.subclass && <p className='text-red-500'>At least 1 subclass is required</p>} </label>
          <label>  Level:  <Controller name="level" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.level && <p className='text-red-500'>Level is required and can't be over 20</p>} </label>
          <label>  Background:  <Controller name="background" control={control} defaultValue="" render={({ field }) => <input className='text-black' type="text" {...field} />} /> {errors.background && <p className='text-red-500'>Character background is required</p>} </label>
          <label>  Alignment:  <Controller name="alignment" control={control} defaultValue="" render={({ field }) => <input className='text-black' type="text" {...field} />} /> {errors.alignment && <p className='text-red-500'>Alignment must be one of lawful, neutral, chaotic combined with one of good, neutral, evil</p>} </label>
          <label>  hit Dice:  <Controller name="hitDice" control={control} defaultValue="" render={({ field }) => <input className='text-black' type="text" {...field} />} /> {errors.hitDice && <p className='text-red-500'> hit dice must be like 7 D8 "number(1-30)[space]D[4|6|8|10|12|20]" </p>} </label>
          <label>  languages:  <Controller name="languages" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-center lg:items-end w-min flex-wrap gap-1'>
          <p className='self-center'>character details & skills</p>
          <label>   MaxHP:   <Controller name="maxHP" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.maxHP && <p className='text-red-500'>maxHP can't be over 9999</p>} </label>
          <label>   AC:   <Controller name="AC" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.AC && <p className='text-red-500'>AC can't be over 60</p>} </label>
          <label>   Proficiency bonus:   <Controller name="proficiency" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.proficiency && <p className='text-red-500'>Proficiency bonus can't be over 10</p>} </label>
          <label>   Initiative:   <Controller name="initiative" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.initiative && <p className='text-red-500'>Initiative can't be over 10</p>} </label>
          <label>   Speed:   <Controller name="speed" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.speed && <p className='text-red-500'>Speed can't be over 999</p>} </label>
          <label>   Strength:   <Controller name="strength" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.strength && <p className='text-red-500'>Strength can't be over 30</p>} </label>
          <label>   Dexterity:   <Controller name="dexterity" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.dexterity && <p className='text-red-500'>Dexterity can't be over 30</p>} </label>
          <label>   Constitution:   <Controller name="constitution" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.constitution && <p className='text-red-500'>Constitution can't be over 30</p>} </label>
          <label>   Intelligence:   <Controller name="intelligence" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.intelligence && <p className='text-red-500'>Intelligence can't be over 30</p>} </label>
          <label>   Wisdom:   <Controller name="wisdom" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.wisdom && <p className='text-red-500'>Wisdom can't be over 30</p>} </label>
          <label>   Charisma:   <Controller name="charisma" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.charisma && <p className='text-red-500'>Charisma can't be over 30</p>} </label>
          <label>   SpellDC:   <Controller name="spellDC" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /> {errors.spellDC && <p className='text-red-500'>spellDC can't be over 60</p>} </label>
          <label>   Feats: <Controller name="feats" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label>  other proficiencies: <Controller name="proficiencies" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-end w-min whitespace-nowrap gap-1'>
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
          <label>  copper pieces:  <Controller name="copper" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /></label>
          <label>  silver pieces:  <Controller name="silver" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /></label>
          <label>  gold pieces:  <Controller name="gold" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /></label>
          <label>  platinum pieces:  <Controller name="platinum" control={control} defaultValue={0} render={({ field }) => <input className='text-black' type="number" {...field} />} /></label>
          <label>  inventory: <Controller name="inventory" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-center lg:items-end w-min flex-wrap gap-1'>
          <p className='self-center'>spells</p>
          <label> Cantrips: <Controller name="cantrips" control={control} defaultValue={[]} render={({ field }) => (<Chips value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl1: <Controller name="lvl1" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl2: <Controller name="lvl2" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl3: <Controller name="lvl3" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl4: <Controller name="lvl4" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl5: <Controller name="lvl5" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl6: <Controller name="lvl6" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl7: <Controller name="lvl7" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl8: <Controller name="lvl8" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> lvl9: <Controller name="lvl9" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>
        <div className='flex flex-col items-center lg:items-end mb-3 lg:m-0  flex-wrap gap-1'>
          <p className='self-center'>weapons</p>
          <label> heavy: <Controller name="heavy" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> light: <Controller name="light" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> reach: <Controller name="reach" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> range: <Controller name="range" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> thrown: <Controller name="thrown" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> loading: <Controller name="loading" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> finesse: <Controller name="finesse" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> special: <Controller name="special" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> versatile: <Controller name="versatile" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> twoHanded: <Controller name="twoHanded" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
          <label> magicalWeapons: <Controller name="magicalWeapons" control={control} defaultValue={[]} render={({ field }) => (<Chips className='text-black' value={field.value} onChange={(e) => field.onChange(e.value || [])} itemTemplate={customChip} />)} /> </label>
        </div>

      </div>
      {submitted ? null : (<div className='flex flex-row justify-center'>
        {!confirmation && <button className='btn btn-accent' type="submit">Submit for Validation</button>}
        {confirmation && <button className='btn btn-primary' type="button" onClick={handleSubmit(onConfirm)}>Confirm Submission</button>}
      </div>)}
    </form>
  );
};

export default CharacterForm;

// modifier should be mathed but player can edit bc of magical item