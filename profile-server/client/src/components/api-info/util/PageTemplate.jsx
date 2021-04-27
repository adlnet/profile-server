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

export default function PageTemplate(props) {
    return (
        <div className="font-ui-xs font-base-dark">
            {props.children}
        </div>
    )
}

export function Header(props) {
    return (
        <div className="grid-row">
            <div className="grid-col">
                <h2 className="text-primary-darker" style={{ textTransform: "capitalize", marginTop: 0 }}>
                    {props.children}
                </h2>
            </div>
        </div>
    )
}

export function SubHeader(props) {
    return (
        <div className="grid-row margin-top-1">
            <div className="grid-col">
                <h3 className="text-primary-dark" style={{ textTransform: "capitalize", marginBottom: "0.2em" }}>
                    {props.children}
                </h3>
            </div>
        </div>
    )
}

export function Description(props) {
    return (
        <div className="grid-row margin-top-1">
            <div className="grid-col">
                {props.children}
            </div>
        </div>
    )
}

export function Lead(props) {
    return (
        <div className="grid-row">
            <div className="grid-col text-bold">
                {props.children}
            </div>
        </div>
    )
}

export function CodeSpan(props) {
    return <span {...props} className="font-code-2xs">{props.children}</span>
}

export function Notice(props) {
    const type = props.type || "info";
    return (
        <div className={`usa-alert usa-alert--${type} usa-alert--slim usa-alert--no-icon`} >
            <div className="usa-alert__body">
                <p className="usa-alert__text font-ui-xs text-base-darker">{props.children}</p>
            </div>
        </div>
    )
}
