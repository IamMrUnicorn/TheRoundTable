import { CharacterPageProps } from "./CharacterImportPage";
import { DMScreen } from "../Components/DMScreen";


export const DMSetupPage = () => {

  return (
    <div className="m-10">
      <div>
        <p>
          session prep for {window.location.href}
        </p>

        <p>
          edit your dm screen if youd like or get your notes ready, once you're all set click the button
        </p>
        <button className="btn btn-primary capitalize font-accent text-2xl">Ready to play</button>
      </div>
      <DMScreen />
    </div>
  );
};
