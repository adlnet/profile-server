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
import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { updateSelectedComponents, deselectComponent } from '../../actions/patterns';
import Flyout from '../controls/flyout';
import PatternInfoPanel from '../infopanels/PatternInfoPanel';
import StatementTemplateInfoPanel from '../infopanels/StatementTemplateInfoPanel';

export default function ArrangeOrder(props) {
    const dispatch = useDispatch();

    const selectedResults = useSelector((state) => state.searchResults.selectedComponents);

    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [infoPanelTemplate, setInfoPanelTemplate] = useState();
    const [infoPanelPattern, setInfoPanelPattern] = useState();

    const updateComponentLocation = result => {
        // make sure the user didn't just drag if out of the drag zone
        if (!(result.destination && result.source)) return;
        let newOrder = [...selectedResults];
        let comp = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, ...comp);
        dispatch(updateSelectedComponents(newOrder));
    }

    const onPatternViewDetailsClick = (pattern) => {
        setInfoPanelTemplate(null);
        setInfoPanelPattern(pattern);
        setShowInfoPanel(true);
    }

    const onTemplateViewDetailsClick = (template) => {
        setInfoPanelPattern(null);
        setInfoPanelTemplate(template);
        setShowInfoPanel(true);
    }

    return (<>
        <div className="grid-row padding-left-3">
            <div className="grid-col">
                <h2>Arrange Order for {props.type}</h2>
            </div>
        </div>

        <DragDropContext onDragEnd={result => { updateComponentLocation(result) }}>
            <div className="grid-row minh-mobile-lg">
                <Droppable droppableId="droppable">
                    {provided => (
                        <div className="grid-col margin-x-2"
                            {...provided.droppableProps}
                            ref={provided.innerRef}>
                            {
                                selectedResults && selectedResults.map((component, idx) => (
                                    <Draggable key={`drag-${idx}`} draggableId={`drag-${idx}`} index={idx}>
                                        {provided => (
                                            <Result
                                                provided={provided}
                                                innerRef={provided.innerRef}
                                                component={component}
                                                onViewDetailsClick={
                                                    component.componentType === "pattern" ?
                                                        () => onPatternViewDetailsClick(component) :
                                                        () => onTemplateViewDetailsClick(component)}
                                            />
                                        )}
                                    </Draggable>
                                ))
                            }

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>

        <Flyout show={showInfoPanel} onClose={() => setShowInfoPanel(false)}>
            {
                (showInfoPanel && infoPanelPattern) &&
                <PatternInfoPanel infoPanelPattern={infoPanelPattern} />
            }
            {
                (showInfoPanel && infoPanelTemplate) &&
                <StatementTemplateInfoPanel infoPanelTemplate={infoPanelTemplate} />
            }
        </Flyout>
    </>)
}

function Result(props) {
    const dispatch = useDispatch();

    return (
        <div
            {...props.provided.draggableProps}
            {...props.provided.dragHandleProps}
            ref={props.provided.innerRef}
            className="grid-row border-top border-bottom padding-top-2 padding-bottom-2 padding-right-1 padding-left-1"
            style={{ backgroundColor: 'white', ...props.provided.draggableProps.style }}>
            <div className="grid-col-1 text-center padding-top-3 padding-right-2">
                <i className="fa fa-bars fa-2x text-base"></i>
            </div>
            <div className="grid-col-9">
                <span className="">{props.component.name}</span><br />
                <span className="font-sans-3xs">
                    {props.component.description}
                </span >
                <br /><br />
                <SecondaryInfo {...props} />
            </div >
            <div className="grid-col-2 text-center">
                <button
                    type="button"
                    className={`usa-button ${props.styles} `}
                    style={{ marginTop: 0, marginRight: 0 }}
                    onClick={() => dispatch(deselectComponent(props.component))}
                >
                    Remove
                </button>
                <button
                    type="button"
                    className="usa-button usa-button--unstyled"
                    style={{ marginTop: ".75rem" }}
                    onClick={props.onViewDetailsClick}
                >
                    View Info
                </button>
            </div>
        </div >
    );
}

function SecondaryInfo(props) {
    let info = [props.component.componentType];
    if (props.component.componentType === "pattern") info.push(props.component.primary ? "Primary" : "Secondary");
    return (
        <span
            className="font-sans-3xs text-base-light"
            style={{ textTransform: 'capitalize' }}>
            {info.join(' | ')}
            {props.component.parentProfile && <> | <span className="text-bold">Profile:</span> {props.component.parentProfile.name}</>}
        </span>
    )
} 
