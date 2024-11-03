import React from 'react';
import FileDrop from '../components/FileDrop';

const DropPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <FileDrop />
    </div>
  );
};

export default DropPage