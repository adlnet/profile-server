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


export default function RelatedStatementTemplatesTable({ objectStatementRefTemplates, contextStatementRefTemplates, rootUrl, url, isMember, isCurrentVersion, isPublished, belongsToAnotherProfile, removeRelatedTemplate, isEditable }) {
    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <span className="text-normal text-base font-ui-2xs">Statement templates with similar requirements that should be used as guidance when creating statements conforming to this statement template.</span>
            </div>
        </div>
        <table className="usa-table usa-table--borderless" width="100%" style={{ marginTop: ".25em" }}>
            <thead>
                <tr>
                    <th width="35%" scope="col">Reference Type</th>
                    <th width="45%" scope="col">Referenced Statement Templates</th>
                    <th width="10%" scope="col"> </th>
                    <th width="10%" scope="col"></th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                <tr>
                    <td>context</td>
                    <td>{contextStatementRefTemplates && contextStatementRefTemplates.length ?
                        <TemplateReferenceCell templateRefs={contextStatementRefTemplates} url={url} rootUrl={rootUrl} />
                        :
                        !isMember || !isCurrentVersion || isPublished || belongsToAnotherProfile || !isEditable ?
                            <span className="text-base font-ui-2xs text-italic">(none)</span> :
                            <Link to={`${url}/context/create`}>
                                <button className="usa-button">Add Statement Template Reference</button>
                            </Link>
                    }
                    </td>
                    {isMember && isCurrentVersion && !isPublished && contextStatementRefTemplates.length && isEditable ?
                        <>
                            <td>
                                <Link
                                    className="usa-button  usa-button--unstyled"
                                    to={`${url}/context/edit`}
                                >
                                    <span className="text-bold" >Edit</span>
                                </Link>
                            </td>
                            <td>
                                <RemoveButton
                                    className="usa-button  usa-button--unstyled"
                                    onClick={() => removeRelatedTemplate('context')}
                                    item="Context statement template reference"
                                    object="template"
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
                <tr>
                    <td>object</td>
                    <td>{objectStatementRefTemplates && objectStatementRefTemplates.length ?
                        <TemplateReferenceCell templateRefs={objectStatementRefTemplates} url={url} rootUrl={rootUrl} />
                        :
                        !isMember || !isCurrentVersion || isPublished || belongsToAnotherProfile || !isEditable ?
                            <span className="text-base font-ui-2xs text-italic">(none)</span> :
                            <Link to={`${url}/object/create`}>
                                <button className="usa-button">Add Statement Template Reference</button>
                            </Link>
                    }
                    </td>
                    {isMember && isCurrentVersion && !isPublished && objectStatementRefTemplates.length && isEditable ?
                        <>
                            <td>
                                <Link
                                    className="usa-button  usa-button--unstyled"
                                    to={`${url}/object/edit`}
                                >
                                    <span className="text-bold" >Edit</span>
                                </Link>
                            </td>
                            <td>
                                <RemoveButton
                                    className="usa-button  usa-button--unstyled"
                                    onClick={() => removeRelatedTemplate('object')}
                                    item="Object statement template reference"
                                    object="template"
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
            </tbody>
        </table>
    </>);
}

function TemplateReferenceCell({ templateRefs, rootUrl }) {
    return (<>
        {templateRefs.map((ref, i) => {
            return <Link to={{ pathname: `${rootUrl}/${ref.uuid}`, state: { templateRef: true } }} key={i} className="usa-link button-link display-block margin-y-1">{ref.name}</Link>
        })}
    </>)
}
