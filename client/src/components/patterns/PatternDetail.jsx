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
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Detail, Tags, Translations } from '../DetailComponents';

export default function PatternDetail(props) {
    const [pattern, setPattern] = useState({});
    let { id } = useParams();

    useEffect(() => {
        if (props.patterns) {
            setPattern(props.patterns.find(pattern => pattern.id === id));
        }
    }, [id, props.patterns]);

    return (<>
        <div className="grid-row">
            <div className="desktop:grid-col">
                <h2>{pattern.name}</h2>
            </div>
            <div className="desktop:grid-col-3">
                <button className="usa-button margin-2 float-right">Edit Pattern</button>
            </div>
        </div>
        <div className="grid-row">
            <div className="desktop:grid-col-8">
                <Detail title="iri">
                    {pattern.iri}
                </Detail>
                <Detail title="type">
                    {pattern.type}
                </Detail>
                <Detail title="primary or secondary">
                    {pattern.primaryOrSecondary}
                </Detail>
                <Detail title="pattern name">
                    {pattern.name}
                </Detail>
                <Detail title="description">
                    {pattern.description}
                </Detail>
                <Detail title="translations">
                    <Translations translations={pattern.translations} />
                </Detail>
                <Detail title="more information">
                    {pattern.moreInformation}
                </Detail>
                <Detail title="tags">
                    <Tags tags={pattern.tags} />
                </Detail>
            </div>
            <div className="desktop:grid-col-3 grid-offset-1">
                <div className="padding-2 bg-base-lightest">
                    <Detail title="updated" >
                        {pattern.updated}
                    </Detail>
                    <Detail title="parent profile" >
                        {pattern.parentProfileName}
                    </Detail>
                    <Detail title="author" >
                        {pattern.author}
                    </Detail>
                </div>
            </div>
        </div>
        <PatternComponentsTable components={pattern.components} type={pattern.type} />
    </>);
}

function PatternComponentsTable(props) {
    return (<>
        <div className="padding-top-1">
            <h2>{`${props.type} Components`}</h2>
        </div>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="45%" scope="col">Name</th>
                    <th width="15%" scope="col">Type</th>
                    <th width="23%" scope="col">Profile</th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {(props.components && props.components.length > 0) ?
                    props.components.map((component, i) => <PatternComponentTableRow key={i} {...component} />) :
                    <tr key={1}><td className="font-sans-xs" colSpan="5">There are no components associated with this profile. Add a component to define relationships between your xAPI statements.</td></tr>
                }
            </tbody>
        </table>
    </>);
}

function PatternComponentTableRow(props) {

    return (
        <tr>
            <th scope="row"><a href="/"><span>{props.name}</span></a></th>
            <td><span className="font-sans-3xs">{props.type}</span></td>
            <td><span className="font-sans-3xs">{props.parentProfileName}</span></td>
        </tr>
    );
}