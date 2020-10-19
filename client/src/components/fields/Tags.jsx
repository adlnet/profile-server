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
import React, { useState, useEffect } from 'react';
import { Field } from 'formik';


export default function Tags(props) {
    const [tagInputValue, setTagInputValue] = useState('');
    const [tags, setTags] = useState(props.field.value || []);

    function keyUpHandler(event) {
        if (event.code === 'Enter' && event.target.nodeName === "INPUT" && event.target.id === 'input-tags') {
            document.getElementById('input-tags-button').click();
        }
    }

    useEffect(() => {
        document.addEventListener('keyup', keyUpHandler);
        return () => {
            document.removeEventListener('keyup', keyUpHandler);
        }
    }, [])

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
        let newTags = [...new Set([...tags, ...splitInputValue])];
        setTags(newTags);
        setTagInputValue('');
        if (props.form) {
            props.form.setFieldValue(props.field.name, newTags);
        }
    }

    return (<>
        {
            !props.isPublished &&
            <div className="grid-row">
                <Field
                    name="tags"
                    type="text"
                    className="usa-input grid-col margin-right-1"
                    id="input-tags"
                    aria-required="true"
                    onChange={e => setTagInputValue(e.target.value)}
                    value={tagInputValue}
                />
                <button
                    className="usa-button grid-col flex-auto"
                    id="input-tags-button"
                    style={{ marginTop: '8px', justify: 'right' }}
                    type="button"
                    disabled={!tagInputValue.trim()}
                    onClick={handleAddTagsButton}
                >
                    Add
                </button>
            </div>
        }
        <div className="margin-top-1 margin-bottom-5">
            {
                tags.map((tag, index) => {
                    return (
                        <span
                            key={index}
                            className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1"
                            style={{ marginTop: '.5em' }}
                        >
                            <span className="">{tag}</span>
                            {!props.isPublished && <span className=""><span className="fa fa-icon fa-close margin-left-05" onClick={() => handleRemoveTagButtonClick(index)} /></span>}
                        </span>
                    );
                })
            }
        </div>
    </>);
}
