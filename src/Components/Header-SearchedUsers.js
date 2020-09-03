import React from 'react';
import {Link} from 'react-router-dom';

export default function SearchedUsers(props){
    
    return(
        <div className="searched-users container">
            {props.foundUsers.map((cur, curIndex) => {
                return(
                    <Link to="/messages">
                    <div
                        className="row searched-user"
                        onClick={props.hideMessagePanel}
                        data-id={cur[4]} data-username={cur[0]}
                        key={curIndex}>

                        <div className="col l1">
                            { cur[3] !== '' ?
                            <img 
                                className="account-image searched-image"
                                src={cur[3]}
                                alt={`${cur[0]}`} 
                            /> : 
                            <i 
                                className="material-icons account-icon searched-icon">
                                account_circle
                            </i>}
                        </div>
                        <div className="col l3">
                            <div
                                className="searched-name bold-weight">
                                {`${cur[1]} ${cur[2]}`}
                            </div>
                            <div className="searched-name searched-username">
                                {cur[4]}
                            </div>
                        </div>
                    </div>
                    </Link>
                )
            })}
            </div>
            
    )
}