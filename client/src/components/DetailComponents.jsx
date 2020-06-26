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

export function Detail(props) {
    return (<>
        <div className="grid-row">
            <div className="desktop:grid-col">
                <span className="details-label">{props.title}</span>
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
                        <span className="margin-05">{tag}</span>
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
            props.translations.map(
                (translation, key) =>
                    <div key={key} className="margin-bottom-05">
                        {
                            props.linkable ?
                                <span
                                    className="usa-link button-link"
                                    onClick={() => onTranslationClick(translation)}
                                >
                                    {translation.language}
                                </span> :
                                <span>{translation.language}</span>
                        }
                    </div>
            )
        }

        <ModalBox show={showModal} onClose={() => setShowModal(false)}>
            <TranslationView initialValue={translationShowing} translations={props.translations} />
        </ModalBox>
    </>);
}

function TranslationView({ initialValue, translations }) {
    const [selectedTranslation, setSelectedTranslation] = useState(initialValue);
    const [selectedLanguage, setSelectedLanguage] = useState(initialValue.language);

    function handleChange(event) {
        setSelectedLanguage(event.target.value);
        setSelectedTranslation(translations.find(translation => translation.language === event.target.value))
    }

    return (
        <div className="translation-form"> 
            <h2>View Translations</h2>
            <div className="grid-row">
                <div className="grid-col-6">
                    <Detail title="language">
                        <select className="usa-select" value={selectedLanguage} onChange={handleChange}>
                            {
                                translations.map((translation, key) => (
                                    <option key={key} value={translation.language}>{translation.language}</option>
                                ))
                            }
                        </select>
                </Detail>
                </div>
            </div>
            <Detail title="name">
                <div className="border-1px padding-105">{selectedTranslation.translationName}</div>
            </Detail>
            <Detail title="description">
                <div className="border-1px padding-105 height-15 overflow-auto">{selectedTranslation.translationDesc}</div>
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
