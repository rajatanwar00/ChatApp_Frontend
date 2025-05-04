import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";

const backendURL=import.meta.env.VITE_API_URL;
let socket;

function Chat() {
  const [msg,setMsg]=useState("");
  const [disp,setDisp]=useState([]);
  const [myId,setMyId]=useState("");
  const bottomRef=useRef();

  useEffect(()=>{
    socket = io(`${backendURL}`);

    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("chat message", (msg) => {
      setDisp((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  },[])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [disp]);

  function sendMessage(){
    if(msg!==""){
      socket.emit("msg",{text:msg,senderId:myId});
      setMsg("");
    }
  }

  return (
    <div className='min-h-screen p-4' style={{backgroundColor:"#e1b382"}}>
        <div className='text-center text-6xl text-gray-300' style={{color:"#12343b"}}>
          Chat Here
        </div>
        
        <div className='flex justify-evenly p-4'>
          
          <div className='w-1/3 border-black border-2 rounded-md p-4 max-h-[80vh] overflow-y-auto'>
            {disp.map((display,index)=>(
              <div className={`p-1 flex min-w-full ${display.senderId===myId?"justify-end":"justify-start"}`}>
                <div key={index} className={`text-white p-1 rounded-md`} style={{backgroundColor:"#2d545e"}}>{display.text}</div>
              </div>              
            ))}
            <div ref={bottomRef} />
          </div>
          
          <div className='p-2 '>
            <input type='text' value={msg} onChange={(e)=>setMsg(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")sendMessage()}} className='p-2 border-2 border-black'/>
            <button onClick={sendMessage} className='ml-2 p-2 w-14 bg-blue-400 rounded-md text-white hover:bg-blue-500'>Send</button>
          </div>
        
        </div>
    </div>
  )
}

export default Chat