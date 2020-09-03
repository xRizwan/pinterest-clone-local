import React from 'react';
import {useSelector} from 'react-redux';
import './styles/UserMessages.css'
import UserSearch from './UserMessages-Search';
import UserInfo from './UserInfo';
import Messenger from './UserMessages-Messenger';
import ChatRooms from './UserMessages-ChatRooms';
import Chats from './UserMessages-ChatData';

export default function UserMessages(props){
    const target = useSelector(state => state.target);
    const roomInfo = useSelector(state => state.room);

    return(
        <div>
            <br />
            <div className="center">Messages</div>
            
            <div className="m-main-container">
                <div className='full-height m-search-container'>
                    <UserSearch />
                    <ChatRooms />
                </div>
                <div className="full-height full-width relativized m-chat-container">
                    {target.length > 0 ?<UserInfo /> : ''}
                    {target.length > 0 && !!roomInfo ? <Chats /> : ''}
                    {target.length > 0 ? <Messenger /> : ''}
                </div>
            </div>

            <div className="center card-panel teal lighten-2">Chat is buggy...</div>

        </div>
    )
}