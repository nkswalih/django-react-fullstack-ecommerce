import React from 'react'

function Overlay() {
  return (
    /* 
      1. z-[99999]: High enough to beat any z-index in your components.
      2. mix-blend-difference: The inversion engine.
      3. h-screen w-screen: Forces it to cover the entire viewport.
    */
    <div className="fixed inset-0 pointer-events-none z-[99999] select-none mix-blend-difference">
      <div 
        className="h-full w-full 
          /* MUST use pure white (#fff) for the inversion math to work */
          bg-[radial-gradient(#fff_1px,transparent_1px)] 
          bg-[size:100px_100px]"
      ></div>
    </div>
  )
}

export default Overlay