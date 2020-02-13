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
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { createOrganization } from '../actions/organizations';

class CreateOrgForm extends React.Component {
  render() {
    return (
      <Formik
        initialValues={{ name: '', description: '', 'more-information': '', tags: '' }}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(15, 'Must be 20 characters or less')
            .required('Required'),
          description: Yup.string()
            .required('Required')
        })}
        onSubmit={(values) => {
          this.props.createOrganization(values);
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



            <button className="usa-button" type="submit">Create Organization</button>  <button className="usa-button usa-button--unstyled" type="reset">Cancel</button>
          </fieldset>
        </Form>
      </Formik>
    );
  }
}



const mapStateToProps = () => ({

});

const mapDispatchToProps = (dispatch) => ({

  createOrganization: (org) => dispatch(createOrganization(org)),

});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(CreateOrgForm));


