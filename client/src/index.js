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
import ReactDOM from 'react-dom';
import App from './App';

import { Provider } from 'react-redux'
import reducer from './reducers';
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

const store = createStore(reducer,
    applyMiddleware(
        thunkMiddleware, // lets us dispatch() functions
      ));


ReactDOM.render(<Provider store={store}>
    <App />
  </Provider>, document.getElementById('root'));

