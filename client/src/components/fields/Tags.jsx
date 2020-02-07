/** ***********************************************************************
*
* Veracity Technology Consultants
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import React, { useState } from 'react';
import { Field } from 'formik';


export default function Tags(props) {
    const [ tagInputValue, setTagInputValue ] = useState('');
    const [ tags, setTags ] = useState(props.field.value || []);

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
                    onChange={ e => setTagInputValue(e.target.value) }
                    value={tagInputValue}
                />
            </div>
            <div className="grid-col-2">
                <button 
                    className="usa-button"
                    style={{marginTop:'.5em', justify:'right'}}
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
                            style={{marginTop:'.5em'}}
                        >
                            {tag}  
                            <span  className="fa fa-icon fa-close"  onClick={ () => handleRemoveTagButtonClick(index) }/>
                        </span>
                    );
                })
            }
        </div>
    </>);
}
