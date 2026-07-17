import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const PlayGround = () => {
  return (
    <div className="bg-primary h-2/5" >
      <TransformWrapper
        wheel={{ step: 0.2 }}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            {/* <div className="tools">
              <button onClick={() => zoomIn()}>+</button>
              <button onClick={() => zoomOut()}>-</button>
              <button onClick={() => resetTransform()}>x</button>
            </div> */}
            <TransformComponent>
              <img src="/Aethoria.jpeg" alt="test" />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default PlayGround;
