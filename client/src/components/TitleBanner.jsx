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
import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

// usa-nav__primary-item>a:hover and [href]:focus cause the blue box
class TitleBanner extends Component {
    getNavClass(path) {
        return this.props.location.pathname === path ? " is-active" : "";
    }

    render() {
        return (<>
            <div className="usa-overlay"></div>
            <header className="usa-header usa-header--basic ">
                <div className="usa-nav-container">
                    <div className="usa-navbar">
                        <div className="usa-logo" id="basic-logo">
                            <em className="usa-logo__text">
                                <a href="/" title="Home" aria-label="Home">ADL xAPI Profile Server</a>
                            </em>
                        </div>
                        <button className="usa-menu-btn">Menu</button>
                    </div>
                    <nav aria-label="Primary navigation" className="usa-nav">
                        <button className="usa-nav__close"><img src="/assets/uswds/2.4.0/img/close.svg" alt="close" /></button>
                        <ul className="usa-nav__primary usa-accordion">
                            <li className={`usa-nav__primary-item${this.getNavClass('/')}`}>
                            {/* <li className="usa-nav__primary-item"> */}
                                <NavLink exact to="/" 
                                         className="usa-nav__link" 
                                         activeClassName="usa-current">
                                             <span>Home</span>
                                </NavLink>
                            </li>
                            <li className={`usa-nav__primary-item${this.getNavClass('/create-profile')}`}>
                                <NavLink exact to="/create-profile" 
                                         className="usa-nav__link" 
                                         activeClassName="usa-current">
                                             <span>Create Profile</span>
                                </NavLink>
                            </li>
                            <li className={`usa-nav__primary-item${this.getNavClass('/user')}`}>
                                <NavLink exact to="/user" 
                                         className="usa-nav__link" 
                                         activeClassName="usa-current">
                                             <span><i className="fa fa-user"></i> user@email.com</span>
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </>);
    }
}

export default withRouter(TitleBanner);