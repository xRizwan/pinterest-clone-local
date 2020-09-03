import React from 'react';
import { useParams } from 'react-router-dom';
import PhotoGrid from './PhotoGrid';

export default function Search(props){
    const params = useParams();

    return(
        <div>
            <br />
            <div className="center">{params.searchid}</div>
            <br />
            <PhotoGrid pref={[params.searchid]}/>
        </div>
    )
}