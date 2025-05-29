import './style/style.css';
import React from 'react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import Loading from './interface/Loading';
import Experience from './Experience';
import Interface from './interface/Interface';
import styledLog from './utils/styledLog';

// Console logs
styledLog(
  'Welcome to Pump.Fun World! 🚀💎',
  'rgb(139, 92, 246)',
  'rgb(6, 255, 165)',
  '22px',
  '600'
);
styledLog('© Pump.Fun Game Studio. Built for the degen community.');
styledLog('Licensed under the GNU AGPL - Diamond Hands License 💎');

// Prevent right click
document.addEventListener('contextmenu', (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <div className="vignette" />
      <div className="sky" />
      <Interface />
      <Canvas flat shadows>
        <Experience />
      </Canvas>
    </Suspense>
  </React.StrictMode>
);
