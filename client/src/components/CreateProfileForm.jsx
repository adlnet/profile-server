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
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

import Translations from "./fields/Translations";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { createProfile, editProfile } from "../actions/profiles";
import Tags from "./fields/Tags";
import history from "../history";
import ErrorValidation from './controls/errorValidation';
import Iri from './fields/Iri';

class CreateProfileForm extends React.Component {
  cancel() {
    if (this.props.onCancel)
      this.props.onCancel()
    else
      history.goBack();
  }
  render() {

    return (
      <Formik
        initialValues={this.props.initialValue || {
          hasIRI: false, iri: '', name: '', description: '', translations: [], moreInformation: '', tags: [],
        }}
        validationSchema={Yup.object({
          hasIRI: Yup.boolean(),
          iri: Yup.string()
            .when("hasIRI", {
              is: true,
              then: Yup.string().required('Required')
            }),
          name: Yup.string()
            .required('Required'),
          description: Yup.string()
            .required('Required'),
        })}
        onSubmit={(values) => {
          if (this.props.initialValue)
            this.props.editProfile(this.props.match.params.organizationId, values)
          else
            this.props.createProfile(this.props.match.params.organizationId, values)
          if (this.props.onSubmit)
            this.props.onSubmit();
        }}
      >
        {(formikProps) => (
          <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
            <fieldset className="usa-fieldset">
              <Iri message="This concept already has an IRI that is used in xAPI statements" {...formikProps} />

              <ErrorValidation name="name" type="input">
                <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span> Name</label>
                <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
              </ErrorValidation>

              <ErrorValidation name="description" type="input">
                <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> Description</label>
                <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
              </ErrorValidation>

              <label className="usa-label" htmlFor="translations">Translations</label>
              <Field name="translations" component={Translations} id="translations" />

              <label className="usa-label" htmlFor="moreInformation">More Information</label>
              <Field name="moreInformation" type="text" className="usa-input" id="input-moreInformation" />

              <label className="usa-label" htmlFor="tags">
                Tags <br />
                <span className="usa-hint font-ui-3xs">Put a comma between each one. Example: <strong>tag 1, tag 2, tag 3</strong></span>
              </label>
              <Field name="tags" component={Tags} className="usa-input" id="input-tags" />

              <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
                {
                  this.props.initialValue ? "Save Changes" : "Create Profile"
                }
              </button>
              <button onClick={() => this.cancel()} className="usa-button usa-button--unstyled" type="reset"><b>Cancel</b></button>
            </fieldset>
          </Form>
        )}
      </Formik>
    );
  }
}




const mapStateToProps = () => ({

});

const mapDispatchToProps = (dispatch) => ({

  createProfile: (orgId, profile) => dispatch(createProfile(orgId, profile)),
  editProfile: (orgId, profile) => dispatch(editProfile(orgId, profile)),

});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(CreateProfileForm));


