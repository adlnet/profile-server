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
import { Link } from 'react-router-dom'

import ModalBox from './controls/modalBox';

/**
 * Creates the label and styling for details fields and form fields
 * @param {string} className more classes to add to the title div
 * @param {boolean} required adds the required * if true
 * @param {string} title the all caps title of the field
 * @param {string} subtitle text that goes beside the title
 */
export function Detail(props) {
    return (<>
        <div className="grid-row">
            {/* can apply className to title of detail */}
            <div className={`desktop:grid-col ${props.className}`}>
                {props.required && <span className="text-secondary">*</span>}<span className="details-label">{props.title}</span>{props.subtitle && <span className="details-subtitle">&nbsp;&nbsp;-&nbsp;&nbsp;{props.subtitle}</span>}
            </div>
        </div>
        <div className="grid-row margin-bottom-3 margin-top-05">
            <div className="desktop:grid-col margin">
                {props.children}
            </div>
        </div>
    </>);
}

export function Tags(props) {
    if (!props.tags) return [];

    return (
        props.tags.filter(tag => tag).map(
            (tag, index) => {
                return (
                    <span
                        key={index}
                        className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1"
                    >
                        <span className="">{tag}</span>
                    </span>
                );
            }
        )
    );
}

export function Translations(props) {
    const [showModal, setShowModal] = useState(false);
    const [translationShowing, setTranslationShowing] = useState();

    if (!props.translations) return "";

    function onTranslationClick(translation) {
        setTranslationShowing(translation);
        setShowModal(true);
    }

    return (<>
        {
            props.translations.length ?
                props.translations.map(
                    (translation, key) =>
                        <div key={key} className="margin-bottom-05">
                            {
                                props.linkable ?
                                    <span
                                        className="usa-link button-link"
                                        onClick={() => onTranslationClick(translation)}
                                    >
                                        {translation.languageName} ({translation.language})
                                </span> :
                                    <span>{translation.languageName} ({translation.language})</span>
                            }
                        </div>
                ) : "None provided"
        }

        <ModalBox show={showModal} onClose={() => setShowModal(false)}>
            <TranslationView langObj={translationShowing} />
        </ModalBox>
    </>);
}

function TranslationView({ langObj }) {
    return (
        <div className="translation-form">
            <h2 style={{ marginTop: '0.2em' }}>View Translation</h2>
            <div className="grid-row">
                <div className="grid-col-6">
                    <Detail title="language">
                        {langObj.languageName} ({langObj.language})
                    </Detail>
                </div>
            </div>
            <Detail title="name">
                <div className="border-1px padding-105">{langObj.translationName}</div>
            </Detail>
            <Detail title="description">
                <div className="border-1px padding-105 height-15 overflow-auto">{langObj.translationDesc}</div>
            </Detail>
        </div>
    )
}

export function LinkDetails(props) {
    if (!props.linkDetails) return "";

    return (props.linkDetails.map(
        (linkDetail, key) =>
            <div key={key}>
                <Link
                    to=''
                    className="usa-link">
                    {linkDetail}
                </Link>
            </div>
    ));
}
