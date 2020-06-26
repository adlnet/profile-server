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

export default class ComponentError extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false }
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true, error: error, info: info });
    }

    render() {
        if (this.state.hasError) {
            return (<>
                <h1>Oops</h1>
                <h2>{this.state.error}</h2>
                <h2>{this.state.info}</h2>
            </>);
        }
        return this.props.children;
    }
}

