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
import React, { useState } from 'react'
import { Link, useRouteMatch } from 'react-router-dom';
import CancelButton from '../controls/cancelButton';

export default function ChooseConceptType({ onCancel }) {
    const { url } = useRouteMatch();
    const [conceptType, setConceptType] = useState();

    return (<>
        <div>
            <div><span className="text-secondary">*</span><span>What type of concept will this be?</span></div>

            <form className="usa-form">
                <RadioButton
                    name="conceptType"
                    id="activity"
                    label="Activity"
                    value="Activity"
                    description='Identifies a specific object which will be interacted with by an actor in a statement. It can be a unit of instruction, experience, or performance that is to be tracked in meaningful combination with a Verb. Interpretation of Activity is broad, and can include tangible objects such as a chair (real or virtual). In the Statement "Anna tried a cake recipe", the recipe constitutes the Activity in terms of the xAPI Statement.'
                    onChange={setConceptType}
                    type={conceptType}
                />
                <RadioButton
                    name="conceptType"
                    id="activityType"
                    label="Activity Type"
                    value="ActivityType"
                    description="Identifies the type of activity in a broader category. For example, a course, video, book, or assessment."
                    onChange={setConceptType}
                    type={conceptType}
                />
                <RadioButton
                    name="conceptType"
                    id="attachmentUsageType"
                    label="Attachment Usage Type"
                    value="AttachmentUsageType"
                    description='Identifies the type of usage of this Attachment. For example, one expected use case for Attachments is to include a "completion certificate".'
                    onChange={setConceptType}
                    type={conceptType}
                />
                <RadioButton
                    name="conceptType"
                    id="document"
                    label="Document"
                    value="Document"
                    description="Identifies information about the data to be stored in the State, Agent Profile, and Activity Profile Resources."
                    onChange={setConceptType}
                    type={conceptType}
                />
                <RadioButton
                    name="conceptType"
                    id="extension"
                    label="Extension"
                    value="Extension"
                    description="Identifies information about the data to be stored in the Context, Result, and Activity Extensions."
                    onChange={setConceptType}
                    type={conceptType}
                />
                <RadioButton
                    name="conceptType"
                    id="verb"
                    label="Verb"
                    value="Verb"
                    description="Identifies the action to be done by the actor a statement."
                    onChange={setConceptType}
                    type={conceptType}
                />
            </form>


            {
                conceptType ?
                    <Link
                        to={`${url}/${conceptType}`}
                        className="usa-button submit-button"
                    >
                        Continue
                </Link> :
                    <button className="usa-button submit-button" disabled>Continue</button>
            }
            <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={onCancel} />
        </div>
    </>
    )
}

function RadioButton(props) {

    return (
        <div className="usa-radio">
            <input
                className="usa-radio__input"
                name={props.name}
                id={props.id}
                type="radio"
                value={props.value}
                checked={props.value === props.type}
                onChange={() => props.onChange(props.value)}
            />
            <label className="usa-radio__label" htmlFor={props.id}>
                <div className="title">{props.label}</div>
                <div className="description">{props.description}</div>
            </label>
        </div>
    );
}
