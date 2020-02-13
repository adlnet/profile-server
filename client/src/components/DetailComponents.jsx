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
import React from 'react';
import { Link } from 'react-router-dom'

export function Detail(props) {
    return (<>
        <div className="grid-row">
            <div className="desktop:grid-col">
                <span className="text-uppercase text-thin text-base font-sans-3xs">{props.title}</span>
            </div>
        </div>
        <div className="grid-row margin-bottom-3">
            <div className="desktop:grid-col margin">
                {props.children}
            </div>
        </div>
    </>);
}

export function Tags(props) {
    if (!props.tags) return "";

    return (
        props.tags.map(
            (tag, index) => {
                return (
                    <span
                        key={index}
                        className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1"
                        style={{ marginTop: '.5em' }}
                    >
                        {tag}
                    </span>
                );
            }
        )
    );
}

export function Translations(props) {
    if (!props.translations) return "";

    return (props.translations.map(
        (translation, key) =>
            <div key={key}>
                <Link
                    to=''
                    className="usa-link">
                    {translation.language}
                </Link>
            </div>
    ));
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
