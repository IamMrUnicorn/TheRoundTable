import { useState, useRef } from "react";
import { HealthBar } from "../HealthBar";
import AvatarEditor from 'react-avatar-editor';
import { useUser } from '@clerk/clerk-react';
import { Chips } from "primereact/chips";
import { customChip } from "../../Pages/CharacterImportPage";
import { CharacterSheetComponentI } from "./CoreStats";

const ImageEditor = ({ image, setImage, editorOpen, setEditorOpen, scale, setScale }) => {
  const editorRef = useRef();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setImage(e.target.result);
      setEditorOpen(true);
    }

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageURL = canvas.toDataURL();
      setImage(imageURL);
      setEditorOpen(false);
    }
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <AvatarEditor
        ref={editorRef}
        image={image}
        width={100}
        height={100}
        borderRadius={50}
        border={10}
        scale={scale}
      />
      <br />
      <input type="range" min="1" max="3" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
      <button onClick={handleSave}>Save</button>
    </>
  );
}


export const InfoBlock = ({ label, content, isEditing, onInputChange, cnPassThrough, editableContent, property1, property2, property3 }: { label:string, content:string, editableContent:string, cnPassThrough?:string, isEditing:boolean,  property1: string, property2?: string, property3?: string, onInputChange?:(value:any, property1:string, property2?:string, property3?:string)=>void}) => {

  return (
      <div className="flex flex-col items-center">
          <div className="underline">
              {isEditing 
                  ? Array.isArray(content)
                      ? <Chips
                            value={editableContent}
                            onChange={(e) => onInputChange(e.value || [], property1, property2, property3)}
                            itemTemplate={customChip}
                            pt={{inputToken: {className: 'text-black bg-white p-1'}, container: {className: 'flex flex-col-reverse'}}}
                        />
                      : <input className='w-11/12 text-center' value={editableContent} onChange={(e)=>onInputChange(e.target.value, property1, property2, property3)} />
                  : Array.isArray(content) 
                      ? content.map((item, index) => <p className={cnPassThrough} key={index}>{item}</p>) 
                      : <p className={cnPassThrough}>{content}</p>
              }
          </div>
          <label className="text-sm font-primary capitalize">{label}</label>
      </div>
  );
};


const CheckboxRow = ({ title }) => (
  <div className="flex flex-row gap-3 justify-center">
    <input type="checkbox" />
    <input type="checkbox" />
    <input type="checkbox" />
    <p className="place-self-center">{title}</p>
  </div>
);

export const Header = ({ characterData, isEditing, onInputChange,  editableCharacterData } : CharacterSheetComponentI) => {
  const { user } = useUser();
  const [image, setImage] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [scale, setScale] = useState(1);

  return (
    <div className="flex flex-row justify-between pt-5 bg-neutral">
      <div className="flex flex-col">
        <div className="rounded-full flex flex-col justify-center border border-solid border-black bg-slate-500 text-center h-48 w-48 font-accent capitalize mr-1">
          {editorOpen && image ? <ImageEditor {...{ image, setImage, editorOpen, setEditorOpen, scale, setScale }} /> :
            !editorOpen && image && <img src={image} alt="Profile" className="rounded-full h-48 w-48" onClick={() => setEditorOpen(true)} />}
        </div>
      </div>

      <div className="flex flex-col w-1/4">
        <div className="flex flex-row justify-center font-accent capitalize text-lg">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="name" content={characterData.name} editableContent={editableCharacterData.name} property1='name' cnPassThrough='text-4xl' />
          {characterData.party_id && <InfoBlock onInputChange={onInputChange} label="party" content={characterData.party_id} cnPassThrough='text-xl pt-5' />}
        </div>
        <div className="flex flex-row justify-center font-accent capitalize text-lg gap-1">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="race" content={characterData.race} property1='race' editableContent={editableCharacterData.race} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="background" content={characterData.background} property1='background' editableContent={editableCharacterData.background} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="alignment" content={characterData.alignment} property1='alignment' editableContent={editableCharacterData.alignment} cnPassThrough="whitespace-nowrap" />
        </div>
        <div className="flex flex-row justify-center font-accent capitalize text-lg gap-1">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="Class" content={characterData.class} property1='class' editableContent={editableCharacterData.class}/>
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="Subclass" content={characterData.subclass} property1='subclass' editableContent={editableCharacterData.subclass}/>
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="Level" content={characterData.level} property1='level' editableContent={editableCharacterData.level}/>
        </div>
      </div>

      {isEditing ? <div className='flex flex-col w-1/4 p-1'>
        <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="currentHP" content={`${characterData.character_stats.currenthp}`} property1='character_stats' property2='currenthp' editableContent={`${editableCharacterData.character_stats.currenthp}`}/>
        <InfoBlock isEditing={isEditing} onInputChange={onInputChange} label="maxHP" content={`${characterData.character_stats.maxhp}`} property1='character_stats' property2='maxhp' editableContent={`${editableCharacterData.character_stats.currenthp}`}/>
      </div> : <div className="flex flex-col p-2 font-accent capitalize text-lg w-1/4">
        <HealthBar currentHealth={characterData.character_stats.currenthp} maxHealth={characterData.character_stats.maxhp} />
        <div className="flex flex-row justify-center">
          <p><span className='text-xl font-primary'>status:</span> {characterData.character_stats.status}</p>
        </div>
        <p className="place-self-center font-primary">death saves</p>
        <CheckboxRow title="success" />
        <CheckboxRow title="failures" />
      </div>}
      
      <div className="flex flex-col font-accent w-1/4">
        <div className="flex flex-row justify-around h-1/2">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} cnPassThrough="text-4xl p-4" label="AC" content={`${characterData.character_stats.ac}`} property1='character_stats' property2='ac' editableContent={`${editableCharacterData.character_stats.ac}`} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} cnPassThrough="text-4xl p-4" label="speed" content={`${characterData.character_stats.speed}ft`} property1='character_stats' property2='speed' editableContent={`${editableCharacterData.character_stats.speed}`}/>
        </div>
        <div className="flex flex-row justify-around h-1/2">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} cnPassThrough="text-4xl p-4" label="initiative" content={`+${characterData.character_stats.initiative}`} property1='character_stats' property2='initiative' editableContent={`${editableCharacterData.character_stats.initiative}`}/>
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} cnPassThrough="text-4xl p-4" label="proficiency bonus" content={`+${characterData.character_stats.proficiency}`} property1='character_stats' property2='proficiency' editableContent={`${editableCharacterData.character_stats.proficiency}`}/>
        </div>
      </div>
    </div>
  );
}
