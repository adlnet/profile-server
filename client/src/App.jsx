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
import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';


import Organizations from './pages/Organizations';
import Organization from './pages/Organization';
import CreateOrganization from './pages/CreateOrganization';

import history from "./history";

import OfficialBanner from './components/OfficialBanner';
import TitleBanner from './components/TitleBanner';

/*
    Below provides an example of using the Sequence React Component provided by this project.
*/
// import { Sequence, Step } from './components/sequence';
// import { Formik, Field, Form, ErrorMessage } from 'formik';
// import { Translations } from "./components/fields/Translations";
// import Tags from "./components/fields/Tags";

// function MyStep(props) {
//     return <div>
//         <div>
//             this is a custom step. I am step {parseInt(props.step) + 1}
//         </div>
//         {props.previousStep && <button onClick={props.previousStep} className="usa-button usa-button--primary"> Prev </button>}
//         {props.nextStep && <button onClick={props.nextStep} className="usa-button usa-button--primary"> Next </button>}
//     </div>
// }

// function SeqFormTest(props) {

//     return (
//         <Formik
//         initialValues={props.initialValue || {}}
//         validationSchema={null}
//         onSubmit={(values) => {
//             console.log(values);
//             }}
//             >
//             <Sequence>
//             <Step title="Pre">
//                     <div>Im not even in the form yo.</div>
//             </Step>
//             <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
//                 <fieldset className="usa-fieldset">
//                         <Step title="This">
//                             <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span> Name</label>
//                             <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
//                             <ErrorMessage name="name" />

//                             <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> Description</label>
//                             <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
//                             <ErrorMessage name="description" />
//                         </Step>

//                         <Step title="is the">
//                             <label className="usa-label" htmlFor="translations">Translations</label>
//                             <Field name="translations" component={Translations} id="translations" />
//                             <label className="usa-label" htmlFor="more-information">More Information</label>
//                             <Field name="more-information" type="text" className="usa-input" id="input-more-information" />
//                             <ErrorMessage name="more-information" />
//                         </Step>
//                         <Step title="title">
//                             <label className="usa-label" htmlFor="tags">
//                                 Tags <br />
//                                 <span className="usa-hint font-ui-3xs">Put a comma between each one. Example: <strong>tag 1, tag 2, tag 3</strong></span>
//                             </label>
//                             <Field name="tags" component={Tags} className="usa-input" id="input-tags" />
//                             <ErrorMessage name="tags" />

//                             <button className="usa-button" type="submit">
//                                 {
//                                      "Create Profile"
//                                 }</button>  <button onClick={() => this.cancel()} className="usa-button usa-button--unstyled" type="reset">Cancel</button>
//                         </Step>
//                 </fieldset>
//             </Form>
//             </Sequence>
//         </Formik>
//     );
// }

export default class App extends Component {

    render() {



        return (<>
            <OfficialBanner />
            <Router history={history}>
                <TitleBanner />
                <Switch>

                    {/* <Route exact path="/testSeq">
                        <div className="grid-container">
                            <SeqFormTest></SeqFormTest>
                        </div>
                    </Route> */}

                    <Route exact path="/">
                        <Organizations />
                    </Route>

                    <Route exact path="/organization/create">
                        <CreateOrganization />
                    </Route>

                    <Route path="/organization/:organizationId">
                        <Organization />
                    </Route>

                </Switch>
            </Router>
        </>);
    }
}
