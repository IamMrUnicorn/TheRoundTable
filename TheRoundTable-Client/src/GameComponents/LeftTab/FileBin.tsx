import { Tabs } from "./FileBinComponents/Tabs"
export const FileBin = () => {

  return (
    <div className="bg-primary p-3 h-full m-3 font-primary capitalize rounded-lg">
      <Tabs />
      <div>
        {/* list/grid view of uploaded files user can sort by upload date or alphabetically  */}
      </div>
      <div>
        {/* bottom bar to confirm file selection and then a play button */}
      </div>
    </div>
  )
}