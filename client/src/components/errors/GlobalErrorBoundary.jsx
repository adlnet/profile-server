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
import React, { Component } from 'react'
import {connect} from "react-redux";


class GlobalErrorBoundary extends Component {
    constructor(props){
        super(props)
       this.state = {}
    }
    componentDidMount()
    {
        window.addEventListener("unhandledrejection", (e) => {
          this.props.throw({errorType:"unhandledrejection"})
          e.preventDefault();
          e.stopImmediatePropagation();
          e.preventDefault();
          return false;
          });
          window.addEventListener("unhandledException", (e) => {
            this.props.throw({errorType:"unhandledException"})
            e.preventDefault();
            e.stopImmediatePropagation();
            e.preventDefault();
          return false;
            });
    }    
    // For this example we'll just use componentDidCatch, this is only 
    // here to show you what this method would look like.
    // static getDerivedStateFromProps(error){
        // return { error: true }
    // }

    componentDidCatch(error, info){
        
        this.props.throw({
           
            errorType:"exception",
            message:error.message,
            stack: info
        })
    }

    render() {
        return this.props.children;
        let errors = [];
        for(let i of this.props.errors)
        {
            errors.push(
                <div className="modalError background">
                        <div className="modalError foreground">
                            <div className="usa-accordion usa-accordion--bordered site-accordion-code">
                                <button className="usa-button-unstyled usa-accordion__button" >
                                Error
                                </button>
                                <div  aria-hidden="false" className="usa-accordion__content site-component-usage">
                                    <p>
                                        {i.errorType}
                                    </p>
                                    <p>
                                        {i.message}
                                    </p>
                                    <button onClick={()=>this.props.clear(i)}className="usa-button">Dismiss</button>
                                </div>
                            </div>
                        </div>
                </div>
            )
        }
        return errors.concat(this.props.children);
    }
}

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        errors: state.globalErrors
    }
  }
  
  const mapDispatchToProps = dispatch => {
    return {
      // dispatching plain actions
      throw: (err) => dispatch({ type: 'GLOBAL_ERROR',...err }),
      clear: (err) => dispatch({ type: 'CLEAR_GLOBAL_ERROR',error:err }),
    }
  }
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(GlobalErrorBoundary)
