import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const gID=import.meta.env.VITE_GID;
const backendURL=import.meta.env.VITE_API_URL;

function Login({onLoginSuccess}) {
    //const navigate=useNavigate();

    async function handleSuccess(googleResponse){
        console.log(googleResponse)
        try{
            const serverResponse= await axios.post(`${backendURL}/login`,{
                authToken:googleResponse.credential
            })

            localStorage.setItem('jwtToken',serverResponse.data.serverToken)
            //navigate('/');
            onLoginSuccess();
        }
        catch(error){
            console.log("Google Verification Successful, but failed response from server",error)
        }
    }

    function handleError(googleResponse){
        console.log("Google Verification Unsuccessful", googleResponse);
    }

  return (
    <GoogleOAuthProvider clientId={gID}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </GoogleOAuthProvider>
  )
}

export default Login