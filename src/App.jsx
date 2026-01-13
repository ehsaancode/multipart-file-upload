import React, { useState } from 'react'
import './App.css'
// import FileUpload from './components/FileUpload'
import SwitchButton from './switchButton/SwitchButton'

function App() {
  const [toggle, setToggle] = useState(false);

  return (
    <>
      {/* <FileUpload /> */}

      <SwitchButton
        toggled={toggle}
        onChange={setToggle}
        width={90}
        height={40}
        padding={4}
        trackBorderRadius="25px"
        indicatorBorderRadius="24px"
        activeTrackColor="#a7f3d0"
        inactiveTrackColor="#cbd5e1"
        toggleIndicator="#ffffff"
      // activeIcon="https://cdn-icons-png.flaticon.com/128/1828/1828884.png"
      // inactiveIcon="https://cdn-icons-png.flaticon.com/128/1828/1828778.png"
      />
    </>




  )
}

export default App
