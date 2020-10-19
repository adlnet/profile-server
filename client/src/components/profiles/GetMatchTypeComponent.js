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

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const getMatchTypeComponent = ( item, dispatch, context, itemIndex, groupIndex) => {

  let prefLabel, conceptType;

  const {
    profileId,
    profileVersion,
    versionId,
    selectedImportedFileIndex,
    onFlyOut,
    setCompareModal,
    addToProfile,
    createNewConcept
  } = context;
  const { description, type } = item.match.model; 
  
  if(type){
    prefLabel = type.toLowerCase() === 'verb' ? Object.values(item.document.verb.display)[0] : 
                (item.document.object.definition && item.document.object.definition.name) ? 
                Object.values(item.document.object.definition.name)[0] : '';

    conceptType = type === "Activity" ? "activityType" : type.toLowerCase();
  }else{
    // must be parentless :(
    prefLabel = item.match.conceptDocument.type.toLowerCase() === 'verb' ? Object.values(item.document.verb.display)[0] : 
                (item.document.object.definition && item.document.object.definition.name) ? 
                Object.values(item.document.object.definition.name)[0] : '';

    conceptType = item.match.conceptDocument.type === "Activity" ? "activityType" : item.match.conceptDocument.type.toLowerCase();
  }

  const putItem = {
    model: { ...item.match.model },
    index: itemIndex,
    type: "statement",
    groupIndex,
    conceptType: conceptType,
  }

  switch (item.match.type) {
    case "yes":
      return {
        title: capitalize(type),
        headerName: "MATCH FOUND",
        headerValue: "MATCH_FOUND",
        content: `This matches an existing ${type}:`,
        document: item.document,
        name: prefLabel,
        description,
        type: type,
        parentProfile: item.match.model.parentProfile
          ? item.match.model.parentProfile.name
          : undefined,
        styledBtnText: "Add to Profile",
        styledBtnClick: () => addToProfile(putItem, profileVersion, selectedImportedFileIndex, versionId, dispatch),
        unStyledBtnText: "View info",
        unStyledBtnClick: () => onFlyOut(true, "statement", item.match.model),
        match: item.match.type,
      };
    case "inProfile":
      return {
        title: capitalize(type),
        headerName: "IN PROFILE",
        headerValue: "IN_PROFILE",
        content: "This concept is already in this profile.",
        document: item.document,
        name: prefLabel,
        description: description,
        type: type,
        parentProfile: item.match.model.parentProfile
          ? item.match.model.parentProfile.name
          : undefined,
        unStyledBtnText: "View info",
        unStyledBtnClick: () => onFlyOut(true, "statement", item.match.model),
      };
    case "partial":
      return {
        title: capitalize(type),
        headerName: "PARTIAL MATCH",
        headerValue: "PARTIAL_MATCH",
        content: `This matches an existing ${type} with some differences:`,
        document: item.document,
        name: prefLabel,
        description: description,
        type: type,
        parentProfile: item.match.model.parentProfile
          ? item.match.model.parentProfile.name
          : undefined,
        styledBtnText: "Compare",
        styledBtnClick: () =>
          setCompareModal({
            show: true,
            addToProfileBtnClick: () => addToProfile(putItem),
            importedData: item.document,
            serverData: item.match.diff.modelDocument,
            diff: item.match.diff,
            serverProfileName: item.match.model.parentProfile.name,
            type: "concept",
          }),
        unStyledBtnText: "View info",
        unStyledBtnClick: () => onFlyOut(true, "statement", item.match.model),
        match: item.match.type,
      };
    case "parentless":
      return {
        title: capitalize(conceptType),
        headerName: "UNKNOWN",
        headerValue: "UNKNOWN",
        content: `<b>Unknown Identifier:</b> This item has not been defined on the server.`,
        document: item.document,
        name: prefLabel,
        description: item.match.conceptDocument.id,
        type: type,
        parentProfile: 'Unknown',
        match: item.match.type,
      };
    case "deprecated":
      return {
        title: capitalize(type),
        headerName: "DEPRECATED",
        headerValue: "DEPRECATED",
        content: `This matches a ${type} on the server that is deprecated:`,
        document: item.document,
        name: prefLabel,
        description: description,
        type: type,
        parentProfile: item.match.model.parentProfile
          ? item.match.model.parentProfile.name
          : undefined,
        unStyledBtnText: "View info",
        unStyledBtnClick: () => onFlyOut(true, "statement", item.match.model),
        match: item.match.type,
      };
    case "no":
    default:
      return {
        title: capitalize(type),
        headerName: "NO MATCH FOUND",
        headerValue: "NO_MATCH_FOUND",
        content: `There is no concept that matches this on the server.`,
        document: item.document,
        name: prefLabel,
        styledBtnText: "Create New Concept",
        styledBtnClick: () => createNewConcept(putItem, profileVersion, selectedImportedFileIndex, profileId, dispatch),
        match: item.match.type,
      };
  }
};

export default getMatchTypeComponent;
