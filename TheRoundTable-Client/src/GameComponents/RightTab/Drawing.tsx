import React, { useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../../socket';

const Drawing = () => {
  const canvasRef = useRef(null);
  const socket = useContext(SocketContext)
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const colors = document.getElementsByClassName('color');
    const context = canvas.getContext('2d');

    const current = {
      color: 'black',
    };
    let drawing = false;

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color,
      });
    };

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onColorUpdate = (e) => {
      current.color = e.target.className.split(' ')[1];
    };

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();

    return () => {
      // Cleanup event listeners
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseout', onMouseUp);
      canvas.removeEventListener('mousemove', throttle(onMouseMove, 10));

      canvas.removeEventListener('touchstart', onMouseDown);
      canvas.removeEventListener('touchend', onMouseUp);
      canvas.removeEventListener('touchcancel', onMouseUp);
      canvas.removeEventListener('touchmove', throttle(onMouseMove, 10));

      for (let i = 0; i < colors.length; i++) {
        colors[i].removeEventListener('click', onColorUpdate);
      }

      socket.off('drawing', onDrawingEvent);

      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="h-full m-0 p-0 ">
      <canvas
        ref={canvasRef}
        className="whiteboard h-full w-full absolute left-0 right-0 top-0 bottom-0"
      ></canvas>
      <div className="fixed">
        <div className="inline-block h-12 w-12 bg-yellow-300"></div>
        <div className="inline-block h-12 w-12 bg-blue-400"></div>
        <div className="inline-block h-12 w-12 bg-red-400"></div>
      </div>
    </div>
  );
};

export default Drawing;
