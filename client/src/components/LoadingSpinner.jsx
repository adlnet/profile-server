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

import { connect } from 'react-redux';


class LoadingSpinner extends React.Component {
    render() {
        if (this.props.loading)
            return <>
                <div className="profile-lightbox">
                    <div className="profile-lightbox-inner">
                        <span style={{fontSize: '34px'}} className="fa fa-gear fa-spin"></span>
                    </div>
                </div>
            </>;
        return "";
    }
}


const mapStateToProps = (state) => ({
    loading: state.application.loading > 0
});

const mapDispatchToProps = () => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoadingSpinner);


