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

import React, { createContext, useContext, useState } from 'react';
import { useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import getMatchTypeComponent from './GetMatchTypeComponent';


import { editProfileVersion, putHarvest } from "../../actions/profiles";
import { loadProfileConcepts } from "../../actions/concepts";

import API from "../../api";

import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import PatternInfoPanel from '../infopanels/PatternInfoPanel';
import StatementTemplateInfoPanel from '../infopanels/StatementTemplateInfoPanel';
import ComparisonModal from './ComparisonModal';
import ModalBox from "../controls/modalBox";

import { deleteHarvest } from '../../actions/profiles';

import { VscTrash } from 'react-icons/vsc';
import { useEffect } from 'react';

const ImportQueueContext = createContext();

const getInfoPanel = (type, details) => {
    switch (type) {
        case 'statement':
        case 'concept':
            return <ConceptInfoPanel infoPanelConcept={details} />;
        case 'pattern':
            return <PatternInfoPanel infoPanelPattern={details} />;
        case 'template':
            return <StatementTemplateInfoPanel infoPanelTemplate={details} />;
        default:
            return null;
    }
}

const QueueDropDown = ({ items, onChange, defaultSelect = 0 }) => {
    const [selected, setSelected] = useState(defaultSelect);
    const onValueChange = (e) => {
        setSelected(e.target.value);
        onChange(e.target.value)
    }

    useEffect(() => {
        setSelected(defaultSelect)
    }, [defaultSelect]);

    return (
        <form className="usa-form" >
            <select className="usa-select" name="options" id="options" value={selected} onChange={onValueChange}>
                {<>
                    {items.map((item, index) => <option key={item.uuid} value={index} >{item.fileName}</option>)}
                    <option value={-1} >Import another file</option>
                </>
                }
            </select>
        </form>
    )
}
const MatchCardHeader = ({ headerName, headerValue, headerContent }) => (
    <>
        <span className="usa-tag" data-value={headerValue}>{headerName}</span>
        <div className="queue-right-item">
            <p className="margin-top-1 margin-bottom-1" dangerouslySetInnerHTML={{ __html: headerContent }}></p>
        </div>

    </>
);
const MatchCardBody = ({ name, description, conceptType, parentProfile }) => {
    let type = conceptType ? <><small>{conceptType}</small><span>|</span></> : null
    return <div className="queue-right-item match-card-body">
        <p className="margin-top-1 margin-bottom-0">{name}</p>
        <small className="margin-bottom-2" style={{ display: 'block' }}>{description}</small>
        <div className="queue-right-body-footer">
            {type}
            <small>
                <b>Profile:</b><span>{parentProfile}</span>
            </small>
        </div>
    </div>
};
const MatchCardFooter = ({ styledBtnText, styledBtnClick, unStyledBtnText, unStyledBtnClick, itemIndex }) => (
    <div className="margin-top-2 margin-bottom-2 match-card-footer">
        {styledBtnText ? <button className="usa-button" style={{ minWidth: '140px' }} onClick={() => styledBtnClick()}>{styledBtnText} </button> : null}
        {unStyledBtnText ? <button className="usa-button--unstyled" style={{ cursor: "pointer" }} onClick={() => unStyledBtnClick(itemIndex)}> {unStyledBtnText}</button> : null}
    </div>
);
const MatchCard = ({ cardData, itemIndex }) => {
    const {
        headerName,
        headerValue,
        content,
        name,
        description,
        type,
        parentProfile,
        styledBtnText,
        styledBtnClick,
        unStyledBtnText,
        unStyledBtnClick
    } = cardData;
    return <>
        <MatchCardHeader
            headerName={headerName}
            headerValue={headerValue}
            headerContent={content}
        />
        {cardData.match !== "no" && 
            <MatchCardBody 
                name={cardData.match !== "parentless" ? name : ''}
                description={description}
                conceptType={type}
                parentProfile={parentProfile}
            />
        }
        <MatchCardFooter
            styledBtnText={styledBtnText}
            styledBtnClick={styledBtnClick}
            unStyledBtnText={unStyledBtnText}
            unStyledBtnClick={unStyledBtnClick}
            itemIndex={itemIndex}
        />
    </>
}
const AccordionItem = ({ item, itemIndex }) => (
    <div className="margin-bottom-2">
        <h2 className="usa-accordion__heading">
            <button className="usa-accordion__button"
                aria-expanded="false"
                aria-controls={`a-${item.document.verb.id}-${itemIndex}`}>
                <span className="accordion-item-title">{item.title}: </span><span>{item.name}</span>
                <span className="usa-tag margin-left-1" data-value={item.headerValue}>{item.headerName}</span>
            </button>
        </h2>
        <div id={`a-${item.document.verb.id}-${itemIndex}`} className="usa-accordion__content usa-prose accordion__content" hidden>
            <div className="grid-container queue-text-code-container">
                <div className="grid-row">
                    <div className="grid-col-8 queue-text-code">
                        <pre className="margin-left-1">{JSON.stringify(item.document, undefined, 2)}</pre>
                    </div>
                    <div className="grid-col-4 margin-left-4">
                        <div className="queue-right-content">
                            <MatchCard
                                cardData={item}
                                itemIndex={itemIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const AccordionGroup = ({ groupTitle, items, componentType, groupIndex }) => {
    const dispatch = useDispatch();
    const context = useContext(ImportQueueContext);

    let accordionItems = items[componentType] ? items[componentType] : items;

    return (
        <> <h3>{groupTitle}</h3>
            {
                accordionItems.map((item, index) => {
                    let matchItem = getMatchTypeComponent(item, dispatch, context, index, groupIndex);

                    return <AccordionItem
                        key={`${groupTitle}${index}`}
                        item={matchItem}
                        itemIndex={index}
                    />
                })
            }
        </>)
}
const EmptyList = ({ linkTo }) => (
    <div className="">
        <p>There are no import queues at this time. <span><button className="usa-button--unstyled" style={{ cursor: 'pointer' }} onClick={linkTo}>Upload a batch of statements</button></span> to begin importing.</p>
    </div>
);

export const deleteConceptProp = (updateHarvest, index, conceptType) =>{
    // the following code will handle the deletion of object properties and objects from the harvestDatas array
    // before sending it to the back-end
    // delete statement verb || activityType property from the object  
    delete updateHarvest.match.data[index][conceptType];
    
    // check to see if any properties are left within the object and if none, remove from array
    if (Object.keys(updateHarvest.match.data[index]).length === 0) {
        updateHarvest.match.data.splice(index, 1);
    }  
    
    return updateHarvest;
}

export default function ProfileImportQueue() {
    const harvestDatas = useSelector(state => state.application.selectedProfileVersion.harvestDatas);
    const profileVersion = useSelector(state => state.application.selectedProfileVersion);
    const profileId = useSelector(state => state.application.selectedProfileId);
    const selectedImportedFileIndex = useSelector(state => state.application.selectedImportedFileIndex);
    const { versionId } = useParams();
    const { url } = useRouteMatch();
    const history = useHistory();
    const dispatch = useDispatch();

    const [fly, showFlyOut] = useState(false);
    const [infoPanelDetails, setInfoPanelDetails] = useState({ type: null, details: null });
    const [removeFileModal, setRemoveFileModal] = useState(false);
    const [compareModal, setCompareModal] = useState({
        show: false,
        addToProfileBtnClick: null,
        importedData: null,
        serverData: null,
        diff: null,
        serverProfileName: null,
        type: null
    });

    const onFlyOut = (show, type, details) => { 
        setInfoPanelDetails({ type, details });
        showFlyOut(show);
    }

    const onImportQueueDropDownChange = (index) => {
        (Number(index) === -1) ?
            history.push(`/organization/${profileVersion.organization.uuid}/profile/${profileId}/version/${profileVersion.uuid}/import`) :
            dispatch({ type: 'UPDATED_IMPORTED_FILE_INDEX', index: Number(index) })
    }

    const formatStatementItems = (item) => {
        const arr = [];

        if (item.verb) arr.push(item.verb);
        if (item.activityType) arr.push(item.activityType);

        return arr;
    }
    const removeImportFile = () => {
        setRemoveFileModal(true)
    }
    const confirmFileRemoval = () => {
        setRemoveFileModal(false)
        dispatch(deleteHarvest(harvestDatas[selectedImportedFileIndex]));
    }

    const isInProfile = (component) => {
        if (profileVersion.concepts.includes(component._id.toString())) {
            return true;
        }
      
        if (profileVersion.externalConcepts.includes(component._id.toString())) {
            return true;
        }
      
        return false;
      }  
    
      const createNewConcept = async (harvestItem)=>{
        const exist = await getConcept(harvestItem.model.iri)
        let matchType = await getMatchType(exist, profileVersion);
        let updateHarvest = JSON.parse(JSON.stringify(profileVersion.harvestDatas[selectedImportedFileIndex]));
        
        if (matchType === 'parentless' || matchType === 'deprecated' || matchType === 'inProfile' || matchType === 'yes') {
          if (matchType === 'yes' || matchType === 'partial') {
              window.alert("This concept matches a concept already on the server.");
              updateHarvest.match.data[harvestItem.groupIndex][harvestItem.conceptType].match.model = exist[0];
          }
          updateHarvest.match.data[harvestItem.groupIndex][harvestItem.conceptType].match.type = matchType;      
          dispatch(putHarvest(updateHarvest));
        } else {
          let path = `/organization/${profileVersion.organization.uuid}/profile/${profileId}/version/${profileVersion.uuid}/concepts/create/${harvestItem.model.type}`;
          history.push({
            pathname: path,
            state: { 
              concept: harvestItem,
              updateHarvest: updateHarvest,
            },
          });
        }    
      }
      
      const addToProfile = async (harvestItem) =>{
        const exist = await getConcept(harvestItem.model.iri)
        let matchType = await getMatchType(exist, profileVersion);
        let updateHarvest = JSON.parse(JSON.stringify(profileVersion.harvestDatas[selectedImportedFileIndex])); 
        
        if (matchType === 'parentless' || matchType === 'deprecated' || matchType === 'inProfile') {
            updateHarvest.match.data[harvestItem.groupIndex][harvestItem.conceptType].match.type = matchType;     
        } else {
          const newProfileVersion = Object.assign({}, profileVersion);
          newProfileVersion.externalConcepts = [
            ...newProfileVersion.externalConcepts,
            harvestItem.model,
          ];
          await dispatch(editProfileVersion(newProfileVersion));
          await dispatch(loadProfileConcepts(versionId));
      
          deleteConceptProp(updateHarvest, harvestItem.groupIndex, harvestItem.conceptType);
        }
      
        dispatch(putHarvest(updateHarvest));
      }
    
      const getConcept = async (iri) =>{
          // replace any hashtag within iri with the encoded version since a hashtag breaks the search
          return await API.searchConcepts(iri.replace('#', '%23'));
      }
    
      const getMatchType = (exist) => {
        if (exist.length) {
          const concept = exist[0];
      
          if (!concept.parentProfile) {
            window.alert("This concept has no parent profile and can not be added.");     
            return 'parentless'
          } else if (concept.isDeprecated) {
            window.alert("This concept has been deprecated and can not be added."); 
            return 'deprecated'
          } else if (isInProfile(concept, profileVersion)){
            window.alert("This concept is already in profile and can not be added.");
            return 'inProfile';
          } else {           
            return 'yes';   
          }
        }
        
        return 'no';    
      };  
    

    return (
        <ImportQueueContext.Provider value={{ profileId, profileVersion, versionId, selectedImportedFileIndex, url, history, onFlyOut, setCompareModal, addToProfile, createNewConcept }}>
            {
                (fly && infoPanelDetails.details) &&
                <Flyout show={fly} onClose={() => onFlyOut(false, null, null)}>
                    {getInfoPanel(infoPanelDetails.type, infoPanelDetails.details)}
                </Flyout>
            }
            { compareModal.show &&
                <div className="comparison-modal">
                    <ComparisonModal
                        show={compareModal.show}
                        onClose={
                            () => setCompareModal(
                                {
                                    show: false,
                                    addToProfileBtnClick: null,
                                    importedData: null,
                                    serverData: null,
                                    diff: null,
                                    serverProfileName: null,
                                    type: null
                                }
                            )}
                        onAddToProfile={compareModal.addToProfileBtnClick}
                        importedData={compareModal.importedData}
                        serverData={compareModal.serverData}
                        diff={compareModal.diff}
                        serverProfileName={compareModal.serverProfileName}
                        type={compareModal.type}
                    />
                </div>
            }
            {
                removeFileModal &&
                <ModalBox show={removeFileModal} onClose={() => setRemoveFileModal(false)}>
                    <div className="remove-file-modal-container">
                        <h2>Remove this File</h2>
                        <p className="margin-top-4">
                            {`Are you sure you want to remove the queue for ${harvestDatas[selectedImportedFileIndex].fileName}?`}
                        </p>
                        <div className="margin-top-5">
                            <button className="usa-button" onClick={confirmFileRemoval}>Remove now</button>
                            <button
                                className="usa-button--unstyled margin-left-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => setRemoveFileModal(false)}
                            >
                                <b>Cancel</b>
                            </button>
                        </div>
                    </div>
                </ModalBox>
            }
            <div className="grid-container import-queue-container">
                {
                    (harvestDatas && harvestDatas.length > 0) &&
                    <>
                        <div className="grid-row queue-toolbar">
                            <div className="grid-col-3">
                                <p>Import Queue for</p>
                            </div>
                            <div className="grid-col-3">
                                <QueueDropDown
                                    items={harvestDatas}
                                    onChange={(index) => onImportQueueDropDownChange(index)}
                                    defaultSelect={selectedImportedFileIndex}
                                />
                            </div>
                            <div className="grid-col-2 grid-offset-4">
                                <button className="usa-button--unstyled import-queue-remove" onClick={removeImportFile}>
                                    <VscTrash />
                                    <span>Remove File</span>
                                </button>

                            </div>
                        </div>
                        <hr></hr>
                    </>

                }
                <div className="grid-row">
                    {(harvestDatas && harvestDatas.length > 0 && harvestDatas[selectedImportedFileIndex]) ?
                        <>
                            {
                                harvestDatas[selectedImportedFileIndex].match.data.map((item, index) =>
                                    <div className="usa-accordion" key={`statement-group-${index}`}>
                                        <AccordionGroup
                                            groupTitle={`Statement ${index + 1}`}
                                            items={formatStatementItems(item)}
                                            componentType="statements"
                                            groupIndex={index}
                                        />
                                    </div>
                                )
                            }
                        </>
                        :
                        <EmptyList linkTo={() => history.push('./import')} />
                    }
                </div>
            </div>
        </ImportQueueContext.Provider>
    )
}



