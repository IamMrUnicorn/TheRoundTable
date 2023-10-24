import React, { useRef } from "react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef} from "react-zoom-pan-pinch";



const Controls = ({ zoomIn, zoomOut, resetTransform }) => (
  <div>
    <button onClick={() => zoomIn()}>+</button>
    <button onClick={() => zoomOut()}>-</button>
    <button onClick={() => resetTransform()}>x</button>
  </div>
);

const Component = ({imgSrc}:{imgSrc:string}) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const zoomToImage = () => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement("imgExample");
    }
  };

  return (
    <TransformWrapper

      initialScale={1}
      initialPositionX={200}
      initialPositionY={100}
      ref={transformComponentRef}
    >
      {(utils) => (
        <React.Fragment>
          <Controls {...utils} />
          <TransformComponent>
            <img src={imgSrc} alt="test" id="imgExample" />
            <div onClick={zoomToImage}>Example text</div>
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>
  );
};
      

const PlayGround: FC = () => {

  return (
    <div className="bg-secondary flex flex-col">

      <div className="PlayGround-map h-[30vh] lg:h-[42vh] flex justify-center">
        <Component imgSrc='/Aethoria.jpeg'/>
        {/* <div className="PlayGround-camera">
      </div> */}
        </div >

        {/* reaction pop up */}
      </div>
      )
}

      export default PlayGround