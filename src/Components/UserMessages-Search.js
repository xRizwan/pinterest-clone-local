import React, {useState, useRef} from 'react';
import SearchedUsers from './Messages-SearchedUsers';

export default function UserSearch(props){
    const [query, setQuery] = useState('');
    const [hidden, setHidden] = useState(true);
    const buttonRef = useRef();
    const containerRef = useRef();

    const handleChange = (e) => {
        setQuery(e.target.value);
    }

    const displayButton = () => {
        buttonRef.current.classList.remove('hide');
        containerRef.current.classList.add('blue-bordered');
        setHidden(false);
    };

    const hideButton = () => {
        buttonRef.current.classList.add('hide');
        containerRef.current.classList.remove('blue-bordered');
        setQuery('');
        setHidden(true);
    };

    return(
        <React.Fragment>
        
            <div className="search-input-container" ref={containerRef}>
                <i className="material-icons search-icon">search</i>
                <input
                    onClick={displayButton}
                    onChange={handleChange}
                    type="text"
                    placeholder="Search"
                    value={query}
                />
                <button
                    onClick={hideButton}
                    ref={buttonRef}
                    className="s-button blackbg-color hide white-text">
                        X
                </button>

                <br />
                <SearchedUsers qData={query} hidden={hidden} reset={hideButton} />
            </div>

        </React.Fragment>
    )
}