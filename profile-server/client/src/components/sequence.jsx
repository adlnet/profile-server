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

function genSteps(children, selected, setSelected, isNotValidated) {
    children = getSteps(children)
    let steps = [];
    for (let i in children) {
        i = parseInt(i)
        steps.push(
            <div key={i} onClick={() => isNotValidated ? undefined : setSelected(i)} className={selected == i ? "sequence-step active" : "sequence-step"}>
                <div className="sequence-step-bar"></div>
                <div className="sequence-step-title">{i + 1 + ". " + (children[i].props.title || "No Title Prop")}.</div>
            </div>
        )
    }
    return <div className="sequence-steps">
        {steps}
    </div>
}
function recursiveMap(children, fn) {
    return React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
            return child;
        }

        if (child.props.children) {
            child = React.cloneElement(child, {
                children: recursiveMap(child.props.children, fn)
            });
        }

        return fn(child);
    });
}
function renderStep(children, step, setStep) {

    let steps = getSteps(children)

    let i = 0;
    let newChildren = recursiveMap(children, (child) => {
        if (child.type == Step) {

            let props = {};
            if (i != steps.length - 1)
                props.nextStep = (e) => { e.preventDefault(); setStep(step + 1); };
            if (i != 0)
                props.previousStep = (e) => { e.preventDefault(); setStep(step - 1); };
            props.step = step;
            props.stepNum = i;
            props.key = i;
            if (i != step) props.hidden = true;
            i = i + 1;
            let newChild = React.cloneElement(child, props)
            return newChild;
        }
        return child;
    })


    return newChildren;
}
function getSteps(children) {

    let steps = [];
    recursiveMap(children, (child) => {
        if (child.type == Step) {
            steps.push(child);
        }
        return child;
    })
    return steps;
}
export function Sequence(props) {

    let children = props.children;//props.children.filter( i => i.type === Step)
    let [step, setStep] = useState(0);

    return <div className="sequence">
        {genSteps(children, step, setStep, props.isNotValidated)}
        {renderStep(children, step, setStep)}
    </div>
}

export function Step(props) {

    let newChildren = [...props.children];
    let buttons = [];

    if (props.previousStep)
        buttons.push(<button key="1" onClick={props.previousStep} className="usa-button usa-button--outline"> Previous </button>)
    if (props.nextStep)
        buttons.push(<button key="2" onClick={props.nextStep} className="usa-button usa-button--primary"> Continue </button>)
    if (props.button) {
        let bprop = { ...props.button.props, key: "3" }
        let bclone = React.cloneElement(props.button, bprop);
        buttons.push(bclone)
    }
    if (props.cancel) {
        buttons.splice(1, 0, props.cancel)
    }



    // newChildren.push(<div key="1children">{buttons}</div>)
    return (
        <div className={`${props.hidden ? "hidden-step" : ""}`}>
            <div className="border border-base-light margin-top-2">

                {newChildren}
            </div>
            {/* <div key="1stepbuttons">{buttons}</div> */}
            {renderButtons(props)}
        </div>
    )
}

function renderButtons(props) {
    return (
        <div className="grid-row">
            <div className="grid-col">
                {props.previousStep ?
                    <button key="1" onClick={props.previousStep} className="usa-button usa-button--outline"> Previous </button>
                    :
                    <button key="2" disabled={props.isNotValidated} onClick={props.nextStep} className="usa-button usa-button--primary"> Continue </button>
                }
                {props.cancel}
            </div>
            <div className="grid-col">
                <div className="pin-right">
                    {props.previousStep && props.nextStep && <button key="2" disabled={props.isNotValidated} onClick={props.nextStep} className="usa-button usa-button--primary"> Continue </button>}
                    {props.button}
                    {props.deprecateButton}
                    <br />
                    {props.deleteButton}
                </div>
            </div>
        </div>
    )

}