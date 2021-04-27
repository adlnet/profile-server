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
import { CodeSpan } from './PageTemplate';

export function HTTPRequest(props) {
    return (<>
        <div className="grid-row padding-1 border-bottom border-accent-warm-light">
            <div className="grid-col-auto">
                <span className="text-bold" style={{ textTransform: "uppercase" }}>{props.method}</span>
            </div>
            <div className="grid-col margin-left-2">
                <span>{props.path}</span>
            </div>
        </div>
        {
            props.queryParams &&
            <ParamTable title="Query Params" values={props.queryParams} textValue={true} />
        }
        {
            props.headers &&
            <ParamTable title="Headers" values={props.headers} expandHeaderColumn={props.expandHeaderColumn} />
        }
        {
            props.children && <>
                <div className="grid-row padding-x-1 margin-bottom-0 margin-top-1">
                    <div className="grid-col"><span className="text-base-darker text-bold">Body</span></div>
                </div>
                <div className="grid-row padding-x-3 margin-bottom-1">
                    {props.children}
                </div>
            </>
        }
    </>);
}

export function HTTPResponse(props) {
    return (<>
        <div className="grid-row border-bottom border-primary-light" style={props.style}>
            <div className="grid-col-auto">
                <span className="text-bold" style={{ textTransform: "uppercase" }}>{props.code}</span>
            </div>
            <div className="grid-col margin-left-2">
                <span>{props.message}</span>
            </div>
        </div>
        {
            props.headers &&
            <ParamTable title="Headers" values={props.headers} />
        }
        {
            props.children && <>
                <div className="grid-row padding-x-1 margin-bottom-0 margin-top-1">
                    <div className="grid-col"><span className="text-base-darker text-bold">Body</span></div>
                </div>
                <div className="grid-row padding-x-3 margin-bottom-1">
                    {props.children}
                </div>
            </>
        }
    </>);
}

export function HTTPResponseAccordion(props) {
    const showSection = props.code && props.code === "200";
    return (<>
        <div className="grid-row padding-left-0" style={props.style}>
            <div className="usa-accordion">
                <div className="usa-accordion__heading border-bottom border-primary-light">
                    <button className="usa-accordion__button bg-white padding-left-1 padding-bottom-1 api-info" style={{ block: "inline" }} aria-expanded={showSection} aria-controls={props.message}>
                        <div className="grid-row">
                            <div className="grid-col-auto">
                                <span className="text-bold" style={{ textTransform: "uppercase" }}>{props.code}</span>
                            </div>
                            <div className="grid-col margin-left-2 text-normal font-ui-xs">
                                <span>{props.message}</span>
                            </div>
                        </div>
                    </button>
                </div>
                <div id={props.message} className="usa-accordion__content margin-0 padding-0" hidden={!showSection}>
                    {
                        props.headers &&
                        <ParamTable title="Headers" values={props.headers} />
                    }
                    {
                        props.children && <>
                            <div className="grid-row padding-x-1 margin-bottom-0 margin-top-1">
                                <div className="grid-col"><span className="text-base-darker text-bold">Body</span></div>
                            </div>
                            <div className="grid-row padding-x-3 margin-bottom-1">
                                {props.children}
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    </>);
}

function ParamTable(props) {
    const usePlainTextValue = props.textValue;
    return (
        <div>
            <div className="grid-row padding-left-1 padding-top-1">
                <div className="grid-col">
                    <span className="text-base-darker text-bold" style={{ fontWeight: "" }}>{props.title}</span>
                </div>
            </div>
            {Object.entries(props.values).map((valobj, i) => {
                const [thekey, value] = valobj;
                return (
                    <div key={i} className="grid-row font-ui-2xs">
                        <div key={i + "key"} className={`${props.expandHeaderColumn ? "grid-col-3" : "grid-col-2"} text-right`}>{thekey}</div>
                        <div key={i + "val"} className="grid-col margin-left-2">{usePlainTextValue ? <span>{value}</span> : <CodeSpan>{value}</CodeSpan>}</div>
                    </div>
                )
            })}
        </div>
    )
}