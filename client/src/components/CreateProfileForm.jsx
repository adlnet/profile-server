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
import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';

import { Translations } from "./fields/Translations";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { createProfile, editProfile } from "../actions/profiles";
import Tags from "./fields/Tags";
import history from "../history";

class CreateProfileForm extends React.Component {
  cancel() {
    if (this.props.onCancel)
      this.props.onCancel()
    else
      history.push("..")
  }
  render() {

    return (
      <Formik
        initialValues={this.props.initialValue || {}}
        validationSchema={null}
        onSubmit={(values) => {
          if (this.props.initialValue)
            this.props.editProfile(this.props.match.params.organizationId, values)
          else
            this.props.createProfile(this.props.match.params.organizationId, values)
          if (this.props.onSubmit)
            this.props.onSubmit();
        }}
      >
        <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
          <fieldset className="usa-fieldset">
            <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span> Name</label>
            <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
            <ErrorMessage name="name" />

            <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> Description</label>
            <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
            <ErrorMessage name="description" />

            <label className="usa-label" htmlFor="translations">Translations</label>
            <Field name="translations" component={Translations} id="translations" />

            <label className="usa-label" htmlFor="more-information">More Information</label>
            <Field name="more-information" type="text" className="usa-input" id="input-more-information" />
            <ErrorMessage name="more-information" />

            <label className="usa-label" htmlFor="tags">
              Tags <br />
              <span className="usa-hint font-ui-3xs">Put a comma between each one. Example: <strong>tag 1, tag 2, tag 3</strong></span>
            </label>
            <Field name="tags" component={Tags} className="usa-input" id="input-tags" />
            <ErrorMessage name="tags" />

            <button className="usa-button" type="submit">
              {
                this.props.initialValue ? "Edit Profile" : "Create Profile"
              }</button>  <button onClick={() => this.cancel()} className="usa-button usa-button--unstyled" type="reset">Cancel</button>
          </fieldset>
        </Form>
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


