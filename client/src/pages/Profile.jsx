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
import { Switch, Route, NavLink, matchPath, Link } from 'react-router-dom';

import Templates from '../components/templates/Templates';
import { Detail, Tags, Translations } from '../components/DetailComponents';
import Concepts from '../components/concepts/Concepts';
import { Patterns } from '../components/patterns/Patterns'

import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { selectOrganization } from "../actions/organizations";
import { selectProfile, populateProfile } from "../actions/profiles";
import history from "../history";
import CreateProfileForm from '../components/CreateProfileForm';
// import Translations from '../components/Translations';

let getNavClass = (linkpath, path) => {
    return matchPath(linkpath, { path }) ? " is-active" : "";
};

//.usa-header--extended .usa-nav {} has border-top (the line between profile title and the tabs/links below it)
class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editing: false }
        // this.setState({ editing: false });
    }
    componentDidMount() {

        this.props.selectProfile(this.props.match.params.organizationId, this.props.match.params.profileId);
        this.props.populateProfile(this.props.match.params.organizationId, this.props.match.params.profileId);
    }
    componentDidUpdate() {
        if (this.props.selectedProfileId !== this.props.match.params.profileId) {
            this.props.selectProfile(this.props.match.params.organizationId, this.props.match.params.profileId);
            this.props.populateProfile(this.props.match.params.organizationId, this.props.match.params.profileId);
        }
    }
    startEdit() {

    }

    cancelEdited() {

        history.push("../" + this.props.match.params.profileId)
    }
    edited() {

        history.push("../" + this.props.match.params.profileId)
    }
    renderHeader() {
        return
    }
    render() {
        if (!this.props.ready) return "";
        if (!this.props.profile) return "";


        let path = this.props.match.path;
        let url = this.props.match.url;
        return (<>
            <div className="outer-alert">

                <div className="usa-alert usa-alert--slim usa-alert--info margin-top-2" >
                    <div className="usa-alert__body">
                        <p className="usa-alert__text">
                            This profile is in a DRAFT state and won’t be available for public use until it is published.
                                </p>
                    </div>
                </div>
            </div>
            <header className="usa-header usa-header--extended">
                <div className="usa-navbar bg-base-lightest">
                    <div className="usa-logo" id="extended-logo">
                        <span className="text-uppercase text-thin font-sans-3xs">Manage Profile</span>
                        <em className="usa-logo__text"><a href="/" title="Home" aria-label="Home">{this.props.profile.name}</a></em>
                    </div>
                    <button className="usa-menu-btn">Menu</button>
                </div>
                <nav aria-label="Primary navigation" className="usa-nav">
                    <div className="usa-nav__inner">
                        <button className="usa-nav__close"><img src="/assets/img/close.svg" alt="close" /></button>
                        <ul className="usa-nav__primary usa-accordion">
                            <li className={`usa-nav__primary-item${getNavClass(`/`, path)}`}>
                                <NavLink exact
                                    to={`${url}`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span>Details</span>
                                </NavLink>
                            </li>
                            <li className={`usa-nav__primary-item${getNavClass(`/templates`, path)}`}>
                                <NavLink
                                    to={`${url}/templates`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span>Statement Templates ({this.props.profile.templates ? this.props.profile.templates.length : 0})</span>
                                </NavLink>
                            </li>
                            <li className={`usa-nav__primary-item${getNavClass(`/patterns`, path)}`}>
                                <NavLink
                                    to={`${url}/patterns`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span>Patterns ({this.props.profile.patterns ? this.props.profile.patterns.length : 0})</span>
                                </NavLink>
                            </li>
                            <li className={`usa-nav__primary-item${getNavClass(`/concepts`, path)}`}>
                                <NavLink
                                    to={`${url}/concepts`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span>Concepts ({this.props.concepts ? this.props.concepts.length : 0})</span>
                                </NavLink>
                            </li>
                        </ul>
                        <div className="usa-nav__secondary">
                            <form className="usa-search usa-search--small ">
                                <select className="usa-select" name="options" id="options">
                                    <option value>Actions</option>
                                    <option value="publish">Publish to Public</option>
                                    <option value="export">Export to File</option>
                                    <option value="import">Import from File</option>
                                    <option value="history">View Version History</option>
                                    <option value="deprecate">Deprecate</option>
                                </select>
                            </form>
                        </div>
                    </div>
                </nav>
            </header>
            <main id="main-content" className="grid-container">

                {!this.state.editing && <Switch>
                    <Route exact path={path}>
                        <Details onEdit={() => this.startEdit()} {...this.props.profile} />
                    </Route>
                    <Route path={`${path}/templates`}>
                        <Templates />
                    </Route>
                    <Route path={`${path}/patterns`}>
                        <Patterns patterns={this.props.profile.patterns} />
                    </Route>
                    <Route path={`${path}/concepts`}>
                        <Concepts />
                    </Route>
                    <Route path={`${path}/edit`}>
                        <h2>Edit Profile Details</h2>
                        <CreateProfileForm onCancel={() => this.cancelEdited()} onSubmit={() => this.edited()} initialValue={this.props.profile}> </CreateProfileForm>
                    </Route>
                </Switch>}
            </main>
        </>

        )
    }
}


function Details(profile) {
    return (
        <>

            <div className="grid-row profile-edit">
                <h2 className="profile-edit">
                    <Link to={`${profile.uuid}/edit`}>
                        <button className="usa-button  usa-button--primary ">
                            <span className="font-sans-2xs text-bold ">Edit Profile Details</span></button>
                    </Link>
                </h2>
                <div className="desktop:grid-col-2">
                    <h2>Profile Details</h2>
                </div>
                <div className="desktop:grid-col-1">

                </div>
            </div>
            <div className="grid-row">
                <div className="desktop:grid-col-9">
                    {/* id, profile name description, translations... */}
                    <Detail title="ID">
                        {profile.uri}
                    </Detail>
                    <Detail title="profile name">
                        {profile.name}
                    </Detail>
                    <Detail title="description">
                        {profile.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={profile.translations} />
                        {/* {profile.translations.map(i =>{
                            return <div>{i.language}</div>
                        })} */}
                    </Detail>
                    <Detail title="more information">
                        <a href={profile.moreInformation}>{profile.moreInformation}</a>
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={profile.tags} />
                    </Detail>
                </div>
                <div className="desktop:grid-col-3 grid-offset-1s">
                    <div className="padding-2 bg-base-lightest">
                        <Detail title="status">
                            {profile.status}
                        </Detail>
                        <Detail title="version">
                            {profile.version}
                        </Detail>
                        <Detail title="updated">
                            {profile.updated}
                        </Detail>
                        <Detail title="author">
                            {profile.author}
                        </Detail>
                    </div>
                </div>
            </div>
        </>
    )
}



const mapStateToProps = (state) => ({
    profile: state.application.selectedProfile,
    concepts: state.concepts,
    selectedProfileId: state.application.selectedProfileId,
    ready: !!state.application.selectedOrganizationId && !!state.application.selectedProfileId
});

const mapDispatchToProps = (dispatch) => ({

    //    selectTemplate: (templateId) => dispatch(selectTemplate(templateId)),
    //    selectPattern: (patternId) => dispatch(selectPattern(patternId)),
    //    selectConcept: (conceptId) => dispatch(selectConcept(conceptId)),
    selectOrganization: (conceptId) => dispatch(selectOrganization(conceptId)),
    selectProfile: (organizationId, profileId) => dispatch(selectProfile(organizationId, profileId)),
    populateProfile: (organizationId, profileId) => dispatch(populateProfile(organizationId, profileId)),

});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(Profile));

