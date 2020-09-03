import React from 'react';
import {useSelector} from 'react-redux';

export default function UserInfo(){
    const target = useSelector(state => state.target);

    return(
        <div className="m-target-info">
            <div>
                {!!target[0].profileImage
                    ? <img
                        src={target[0].profileImage}
                        alt="profileimage"
                        className="account-image m-account-image move-up1" 
                       />
                    : <i className="material-icons m-account-icon move-up1">account_circle</i>}
            </div>
            <div>
                <div className="m-name">
                    {!!target[0].firstName ? `${target[0].firstName} ` : ''}
                    {!!target[0].lastName ? `${target[0].lastName} ` : ''}
                </div>
            </div>
        </div>
    )
}