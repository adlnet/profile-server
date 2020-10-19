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
import RemoveButton from '../controls/removeButton';

export default function DeterminingPropertyTableRow({ determiningProperty, removeDeterminingProperty, onPropertyClick, url, isMember, isCurrentVersion, isPublished }) {

    return (
        <tr>
            <th scope="row">
                {determiningProperty.propertyType}
            </th>
            <td>
                {
                    Array.isArray(determiningProperty.properties) ?
                        determiningProperty.properties.map((property, key) => (
                            property.name ? (
                                <Link
                                    className="usa-link button-link display-block margin-y-1"
                                    key={key}
                                    to={`${url}/${property.uuid}`}
                                >
                                    {property.name}
                                </Link>
                            )
                                : property.iri
                        ))
                        : (
                            determiningProperty.properties && determiningProperty.properties.name ? (
                                <Link
                                    className="usa-link button-link"
                                    to={`${url}/${determiningProperty.properties.uuid}`}
                                >
                                    {determiningProperty.properties && determiningProperty.properties.name}
                                </Link>
                            )
                                : determiningProperty.properties.iri
                        )
                }
            </td>
            {isMember && isCurrentVersion && !isPublished ?
                <>
                    <td>
                        <Link
                            className="usa-button  usa-button--unstyled"
                            to={`${url}/${determiningProperty.propertyType}/edit`}
                        >
                            <span className="text-bold" >Edit</span>
                        </Link>
                    </td>
                    <td>
                        <RemoveButton
                            onClick={() => removeDeterminingProperty(determiningProperty.propertyType)}
                            className="usa-button  usa-button--unstyled"
                            item="Determining property"
                            object="statement template"
                        />

                    </td>
                </>
                :
                <>
                    <td> </td>
                    <td> </td>
                </>
            }
        </tr>
    );
}
