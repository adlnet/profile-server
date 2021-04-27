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
import React, { useEffect, useCallback } from 'react';

export default function FileDrop({ onDrop, onDragIn, onDragOut, onDrag, children, classes=[]}){
    const [drag, setDrag] = React.useState(false);
    const [filename, setFilename] = React.useState('');
    let dropRef = React.createRef();
    let dragCounter = 0;
  
    const handleDrag = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      if(onDrag) onDrag();
    });
  
    const handleDragIn = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setDrag(true);

      if(onDragIn) onDragIn();
    });
  
    const handleDragOut = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) setDrag(false);
      if(onDragOut) onDragOut();
    });
  
    const handleDrop = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {        
        setFilename(e.dataTransfer.files[0].name);
        e.dataTransfer.clearData();
        dragCounter = 0;
        if(onDrop) onDrop(e.dataTransfer.files[0]);
      }
    });
  
    useEffect(() => {      
      let div = dropRef.current;
        div.addEventListener('dragenter', handleDragIn);
        div.addEventListener('dragleave', handleDragOut);
        div.addEventListener('dragover', handleDrag);
        div.addEventListener('drop', handleDrop);
      return () => {         
        div.removeEventListener('dragenter', handleDragIn);
        div.removeEventListener('dragleave', handleDragOut);
        div.removeEventListener('dragover', handleDrag);
        div.removeEventListener('drop', handleDrop);

      };
    },[]);
  
    return (
    <div ref={dropRef} className={classes.join(" ")}>
        {children}
    </div>
    );
  };