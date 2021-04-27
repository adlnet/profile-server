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

import React, { useReducer, useRef, useEffect } from "react";
import { useHistory, Redirect, useRouteMatch } from 'react-router-dom';

import { useDispatch, useSelector } from "react-redux";

import FileDrop from './FileDrop';

import { IconContext } from "react-icons";

import { HiOutlineCloudUpload } from "react-icons/hi";
import { FaFileCode } from "react-icons/fa"

import { formatSizeUnits } from '../../utils';
import ProgressBar from './ProgressBar';

import { harvest } from '../../actions/profiles'

// HANDLE ALL OF THE INTERNAL IMPORT COMPONENT STATES
const initialState = {
  dragHover: false,
  fileDropped: false,
  importing: -1,
  cancelled: false,
  file: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'ON_FILE_DRAG':
      return { ...state, dragHover: true }
    case 'ON_FILE_LEAVE':
    case 'ON_FILE_DRAG_UP':
      return { ...state, dragHover: false }
    case 'FILE_DROPPED':
      return { ...state, fileDropped: true, file: action.payload };
    case 'FILE_UPLOADING':
      return { ...state, importing: 0 };
    case 'FILE_IMPORT_COMPLETE':
      return { ...state, importing: 1 };
    case 'FILE_UPLOAD_CANCELLED':
      return { ...state, cancelled: true, fileDropped: false, file: null, importing: -1, dragHover: false };
    case 'SET_FILE':
      return { ...state, file: action.payload }
    case 'RESET':
      return{
        dragHover: false,
        fileDropped: false,
        importing: -1,
        cancelled: false,
        file: null
      }
    default:
      console.warn("NO SUCH IMPORT FILE ACTION TYPE");
  }
}
export default function ProfileImport() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { file, dragHover } = state;

  const hiddenFileInput = useRef(null);
  const history = useHistory();

  const reduxDispatch = useDispatch();
  const uploading = useSelector(state => state.application.uploading);
  const errors = useSelector(state => state.errors);

  const dropped = (file) => {
    const fileType = file.name.substring(file.name.indexOf('.'), file.name.length);

    if (fileType !== '.json') {
      console.warn("Choose a JSON file of xAPI statements or a profile in a valid JSON-LD file.");
      dispatch({type:'ON_FILE_DRAG_UP'})
    } else {
      const formData = new FormData();      
      formData.append('statement', file);

      dispatch({ type: 'FILE_DROPPED', payload: formData });
    }
  };
  const handleBrowseClick = e => {
    hiddenFileInput.current.click();
  }
  const handleChange = e => {
    dropped(e.target.files[0])
  };

  const cancelledUpload = () => {
    dispatch({ type: 'FILE_UPLOAD_CANCELLED' });
    controller.abort();
  };
    
  // use for aborting
  let controller = new AbortController();

  useEffect(() => {
    if (file) {
      let options = {signal: controller.signal}
      reduxDispatch(harvest(file, options));
    }
  }, [file]);

  useEffect(()=>{
    let harvestError = errors.filter( error => error.type === 'ERROR_HARVEST');

    if(harvestError.length && uploading === 1){      
        window.alert(`Before importing again, Please dismiss this error "${harvestError[0].error}".`);
        harvestError.forEach(error => reduxDispatch({ type: 'CLEAR_ERROR', error: error }));
        
        reduxDispatch({type: 'SET_UPLOADING_STATE', payload:-1});
        dispatch({type:'RESET'})
    }

    if(uploading === 1 && harvestError.length === 0) {
      reduxDispatch({type:'SET_UPLOADING_STATE' , payload: -1});
      history.push('./queue');
    }
  },[uploading, errors])

  return (
    <>
    <div className="grid-container import">
      <div className="grid-row">
        <div className="tablet:grid-col-4 import-content margin-top-0">
          <h5>Import with sample statements</h5>
          <p className="margin-top-0">Import a collection of xAPI statements from a valid JSON file.</p>
          <p>
            Entries in your file will be parsed and matched to what exists on the server to promote reuse of existing concepts.
          </p>
          <p>You can review each item for accuracy before adding to the profile.</p>
          <i>A maximum of 20 statements can be imported per file.</i>
        </div>
        <div className="tablet:grid-col-8">
          
          {state.fileDropped ?
            <div className="import-target">
              <IconContext.Provider
                value={{
                  color: "#538200",
                  size: "8.5em",
                  pointerEvent: "none"
                }}
              >
                <HiOutlineCloudUpload />
              </IconContext.Provider>
              <p>Uploading...</p>
              <div className="import-progress-container">
                <div>
                  <IconContext.Provider
                    value={{
                      color: "#C9C9C9",
                      size: "3.5em",
                      pointerEvent: "none"
                    }}
                  >
                    <FaFileCode />
                  </IconContext.Provider>
                </div>

                <div className="progress-bar-container">
                  <div className="progress-bar-row">
                    <p>{file.name}</p>
                    <p>{formatSizeUnits(file.size)}</p>
                  </div>
                  <ProgressBar bgcolor={'#538200'} completed={60} />
                  <div className="progress-bar-row">
                    <small>% done</small>
                    <button className="progress-cancel-button" onClick={cancelledUpload}>
                      <small>cancel upload</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            :
            <FileDrop
              onDrop={dropped}
              onDragIn={() => dispatch({ type: 'ON_FILE_DRAG' })}
              onDragOut={() => dispatch({ type: 'ON_FILE_LEAVE' })}
              classes={["import-target"]}
            >
              <IconContext.Provider
                value={{
                  color: dragHover ? "#538200" : "#C9C9C9",
                  size: "8.5em",
                  pointerEvent: "none"
                }}
              >
                <HiOutlineCloudUpload />
              </IconContext.Provider>
              <p>
                Choose a JSON file of xAPI statements to begin upload.
              </p>
              <button className="usa-button" onClick={handleBrowseClick}>Browse for file</button>
              <input
                ref={hiddenFileInput}
                onChange={handleChange}
                type="file"
                className="import-browse-button"
                accept=".json"
              />
              <small>or drag file to upload</small>
            </FileDrop>
          }
        </div>
      </div>
    </div>
    </>
  );
}
