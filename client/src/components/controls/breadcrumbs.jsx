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
import { Link } from 'react-router-dom';

/**
 * creates breadcrumb links on a page.. needs breadcrumbs property, 
 * which is an array of breadcrumb objects with a 'to' and 'crumb'
 * @param {Array} breadcrumbs [{to: url, crumb: link text} ]
 */
export default function Breadcrumb({ breadcrumbs }) {
    return (
        breadcrumbs.map((b, i) => (
            <span key={i}><Link to={b.to}><span className="breadcrumb">{b.crumb}</span></Link> <i className="fa fa-angle-right margin-x-05"></i> </span>
        ))
    );
}