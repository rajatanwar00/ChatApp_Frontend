import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
import Popup from 'reactjs-popup';
import Login from './Login';
import axios from 'axios';

const backendURL=import.meta.env.VITE_API_URL;
let socket;

function Chat() {
  const [msg,setMsg]=useState("");
  const [disp,setDisp]=useState([]);
  const [myId,setMyId]=useState("");
  const [user,setUser]=useState('')
  const [picture,setPicture]=useState('')
  const bottomRef=useRef();
  const [popup,setPopup]=useState(true);
  const [token,setToken]=useState(localStorage.getItem('jwtToken'));
  //const [refresh,setRefresh]=useState(0);

  useEffect(()=>{
    //const token=localStorage.getItem('jwtToken');
    if(token)
    axios.get(`${backendURL}/user`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    .then((response)=>{
        setUser(response.data.name);
        setPicture(response.data.picture);
    })
    .catch((err)=>{
        console.log(err);
    })
},[token])

  useEffect(()=>{
    //const serverToken=localStorage.getItem('jwtToken');
    const serverToken=token;
    socket = io(`${backendURL}`,{
      auth: {
        token: serverToken, 
      },
    });

    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("chat message", (msg) => {
      setDisp((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      //localStorage.clear();
    };
  },[token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [disp]);

  function sendMessage(){
    if(msg!==""){
      socket.emit("msg",{text:msg,senderId:myId,user:user});
      setMsg("");
    }
  }

  function logout(){
    localStorage.clear();
    // setToken('');
    // setUser('');
    window.location.reload();
  }

  return (
    <div className='min-h-screen ' style={{backgroundColor:"#e1b382"}}>
        {!token?(
          <Popup open={popup} closeOnDocumentClick={false} setPopup={setPopup} setToken={setToken}>
            <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center'>
              <div className='border-1 border-black p-40 bg-black/10 rounded-md flex flex-col justify-around'>
                <div className='flex justify-between items-center text-3xl p-2 mb-10'>
                  New Here?<br></br>
                  Login to continue
                </div>
                
                <div className='p-2 mt-10'>
                  <Login onLoginSuccess={()=>{setPopup(false);setToken(localStorage.getItem('jwtToken'))}} />
                </div>  
              </div>                          
            </div>            
          </Popup>
        ):(<div/>)}
        
      
        <div>
          <div className='text-center text-6xl text-gray-300 p-4' style={{color:"#12343b", backgroundColor:"#d79b5b"}}>
            <p>Chat Here</p>
            <div className='flex justify-between text-2xl'>
              <label>{user}</label>
              <button onClick={logout} className='bg-red-500 hover:bg-red-600 p-2 text-white rounded-md text-xl'>Logout</button>
            </div>
            <hr/>
          </div>
        
          <div className='flex justify-evenly p-4'>
            
            <div className='w-2/4 border-black border-2 rounded-md p-4 max-h-[80vh] overflow-y-auto'>
              {disp.map((display,index)=>(
                <div className={`p-1 flex min-w-full ${display.senderId===myId?"justify-end":"justify-start"}`}>
                  <div key={index} className={`text-white p-1 pl-0 pr-0 pt-0 rounded-md min-w-36`} style={{backgroundColor:"#2d545e"}}>
                    <div className='text-xs p-1' style={{backgroundColor:"#192e34"}}>
                      {display.user}
                    </div>
                    <div className='text-lg p-1'>
                      {display.text}
                    </div>                    
                  </div>
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
      {/* )} */}
        
    </div>
  )
}

export default Chat