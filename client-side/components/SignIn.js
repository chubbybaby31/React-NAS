import React, { useState } from 'react';
import { auth, provider } from "./FirebaseLogin";
import { signInWithPopup } from "firebase/auth";
import FileList from './File';

const SignIn = () => {

    const [email, setEmail] = useState('');
    const [dN, setDisplayName] = useState('');
    const [pfpURL, setPfpURL] = useState('');


    const handleSignIn = () => {
    signInWithPopup(auth, provider).then((data) => {
        setEmail(data.user.email);
        setDisplayName(data.user.displayName);
        setPfpURL(data.user.photoURL);
        localStorage.setItem("email",data.user.email);
    });

    };
  return (
    <div>
      {email?<FileList dn={dN} dp={pfpURL} email={email}/>:
      <button class="login-button" onClick={handleSignIn}>LOGIN</button>
      }
    </div>
  );
}


export default SignIn;