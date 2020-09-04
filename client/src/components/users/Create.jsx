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
import { useHistory, useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user";

export default function CreateAccount(props) {
  let dispatch = useDispatch();
  let userData = useSelector((store) => store.userData)
  const history = useHistory();
  function cancel() {
    history.push('/')
  }

  async function createAccount(createRequest) {
    dispatch(user_actions.createAccount(createRequest))
  }

  return (<>
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      validationSchema={Yup.object({
        username: Yup.string()
          .required('Required'),
        password: Yup.string()
          .required('Required'),
        email: Yup.string()
          .required('Required'),
      })}
      onSubmit={(values) => {
        createAccount(values);
      }}
    >
      {(formikProps) => (
        <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
          <fieldset className="usa-fieldset">

            <ErrorValidation name="username" type="input">
              <label className="usa-label" htmlFor="username"><span className="text-secondary">*</span> Username</label>
              <Field name="username" type="text" className="usa-input" id="input-username" aria-required="true" />
            </ErrorValidation>

            <ErrorValidation name="email" type="input">
              <label className="usa-label" htmlFor="email"><span className="text-secondary">*</span> Email</label>
              <Field name="email" type="text" className="usa-input" id="input-email" aria-required="true" />
            </ErrorValidation>

            <ErrorValidation name="password" type="input">
              <label className="usa-label" htmlFor="password"><span className="text-secondary">*</span> Password</label>
              <Field name="password" type="password" className="usa-input" id="input-password" aria-required="true" />
            </ErrorValidation>

            <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
              Create Account
                </button>

            <button onClick={() => cancel()} className="usa-button usa-button--unstyled" type="reset"><b>Cancel</b></button>
          </fieldset>
        </Form>
      )}

    </Formik>
    {
      userData.createFeedback && <div className="usa-error-message padding-right-1"><p>{userData.createFeedback}</p></div>
    }
  </>
  );
}