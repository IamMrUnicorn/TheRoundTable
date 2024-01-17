import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const PlayGround = () => {
  return (
    <div className="bg-secondary" >
      <TransformWrapper
        wheel={{ step: 0.2 }}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            <div className="tools">
              <button onClick={() => zoomIn()}>+</button>
              <button onClick={() => zoomOut()}>-</button>
              <button onClick={() => resetTransform()}>x</button>
            </div>
            <TransformComponent>
              <img src="/Aethoria.jpeg" alt="test" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default PlayGround;
