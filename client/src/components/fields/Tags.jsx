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
import { Field } from 'formik';


export default function Tags(props) {
    const [tagInputValue, setTagInputValue] = useState('');
    const [tags, setTags] = useState(props.field.value || []);

    function handleRemoveTagButtonClick(index) {
        let newTags = [...tags];
        newTags.splice(index, 1);
        setTags([...newTags]);
        if (props.form) {
            props.form.setFieldValue(props.field.name, newTags);
        }
    }

    function handleAddTagsButton() {
        let splitInputValue = tagInputValue.split(',').map(value => value.trim()).filter(Boolean);
        let newTags = [...tags, ...splitInputValue];
        setTags(newTags);
        setTagInputValue('');
        if (props.form) {
            props.form.setFieldValue(props.field.name, newTags);
        }
    }

    return (<>
        <div className="grid-row grid-gap">
            <div className="grid-col-10">
                <Field
                    name="tags"
                    type="text"
                    className="usa-input width-full"
                    id="input-tags"
                    aria-required="true"
                    onChange={e => setTagInputValue(e.target.value)}
                    value={tagInputValue}
                />
            </div>
            <div className="grid-col-2">
                <button
                    className="usa-button"
                    style={{ marginTop: '.5em', justify: 'right' }}
                    type="button"
                    disabled={!tagInputValue}
                    onClick={handleAddTagsButton}
                >
                    Add
                </button>
            </div>
        </div>
        <div className="margin-top-1 margin-bottom-5">
            {
                tags.map((tag, index) => {
                    return (
                        <span
                            key={index}
                            className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1"
                            style={{ marginTop: '.5em' }}
                        >
                            {tag}
                            <span className="fa fa-icon fa-close" onClick={() => handleRemoveTagButtonClick(index)} />
                        </span>
                    );
                })
            }
        </div>
    </>);
}
