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
import React, { useState } from 'react'

function genSteps(children, selected, setSelected) {
    children = getSteps(children)
    let steps = [];
    for (let i in children) {
        i = parseInt(i)
        steps.push(
            <div onClick={() => setSelected(i)} className={selected == i ? "sequence-step active" : "sequence-step"}>
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

    return <div>
        {genSteps(children, step, setStep)}
        {renderStep(children, step, setStep)}
    </div>
}

export function Step(props) {

    let newChildren = [...props.children];
    let buttons = [];

    // add key to items in this newChildren array
    // set prevent default on buttons
    if (props.previousStep)
        buttons.push(<button key="1" onClick={props.previousStep} className="usa-button usa-button--primary"> Prev </button>)
    if (props.nextStep)
        buttons.push(<button key="2" onClick={props.nextStep} className="usa-button usa-button--primary"> Next </button>)
    newChildren.push(<div>{buttons}</div>)
    return <div className={props.hidden ? "hidden-step" : ""}>

        {newChildren}
    </div>
}