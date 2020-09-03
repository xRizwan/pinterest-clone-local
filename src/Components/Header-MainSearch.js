import React, {useState, useRef} from 'react';
import SearchedTags from './Header-SearchedTags';

export default function MainSearch(props){
    const [query, setQuery] = useState('');
    const [isHidden, setIsHidden] = useState(true);
    const closeBtnRef = useRef();
    const inputRef = useRef();
    const containerRef = useRef();

    function handleChange(e){
        setQuery(e.target.value);
    }
    
    function makeBigger(e){
        e.target.classList.add('big-input');
        containerRef.current.classList.add('big-container');
        closeBtnRef.current.classList.remove('hide');
        setIsHidden(false);
    }

    function makeSmaller(e){
        inputRef.current.classList.remove('big-input');
        containerRef.current.classList.remove('big-container');
        closeBtnRef.current.classList.add('hide');
        setQuery('');
        setIsHidden(true);
    }

    return(
        <React.Fragment>
            <div ref={containerRef} className="col center l4 m2 input-field search-bar-container">
                <i className="material-icons">search</i>
                <input
                    ref={inputRef}
                    onChange={handleChange}
                    onClick={makeBigger}
                    id="search"
                    type="text"
                    placeholder="Search"
                    value={query}
                />
                <button
                    ref={closeBtnRef}
                    onClick={makeSmaller}
                    className="s-button blackbg-color hide white-text">
                        X
                </button>
                <SearchedTags qData={query} hidden={isHidden} makeSmaller={makeSmaller}/>
            </div>
        </React.Fragment>
    )
}