/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
import React from 'react'
import {useState,useEffect} from 'react';
import api from '../../api';
export default function Lock({children=[],resourceUrl})
{
    let [haveLock,setLock] = useState(false);
    let [lockMessage,setLockMessage] = useState("");

    let func = async function(){
            
        if(haveLock)
            return; 
        let lockState = await api.getJSON(resourceUrl +"/lock");
        
        if(lockState.success == false)
        {
            setLock(false); setLockMessage(lockState.message);
        }
        if(lockState.success == true)
        {
            setLock(true); setLockMessage(lockState.message);
        }
        
    }; 

    useEffect(()=>{

        func();
        return () =>{
        
            api.getJSON(resourceUrl +"/unlock");
        }
    },[])
    if(!haveLock) return <div>
        <div><p>{ lockMessage || "Trying to obtain write lock." }</p></div> 
        <div className="usa-button" onClick={()=>func()}> Retry </div> 
    </div>
    else 
    return children;
}