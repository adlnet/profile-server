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
import { useParams } from 'react-router-dom';

import CreateSequencePattern from './CreateSequencePattern';
import CreateAlternatesPattern from './CreateAlternatesPattern';
import CreateSinglePattern from './CreateSinglePattern';

export default function EditPattern({ pattern, onEdit, isPublished, setEditing, root_url, onDeprecate }) {
    let { patternId } = useParams();

    let type = pattern && pattern.type;
    setEditing(true);

    let capitalize = () => {
        return { textTransform: "capitalize" }
    }

    return (<>

        {
            (type === "sequence") ?
                <CreateSequencePattern key={`${patternId}-sequence`} type={type} pattern={pattern} components={pattern[pattern.type]} onSubmit={onEdit} isPublished={isPublished} root_url={root_url} setEditing={setEditing} onDeprecate={onDeprecate} />
                : (type === "alternates") ?
                    <CreateAlternatesPattern key={`${patternId}-alternates`} type={type} pattern={pattern} components={pattern[pattern.type]} onSubmit={onEdit} isPublished={isPublished} root_url={root_url} setEditing={setEditing} onDeprecate={onDeprecate} />
                    : (type) ? <CreateSinglePattern key={`${patternId}-single`} pattern={pattern} components={pattern[pattern.type]} onSubmit={onEdit} isPublished={isPublished} root_url={root_url} setEditing={setEditing} onDeprecate={onDeprecate} />
                        : ""

        }
    </>);
}