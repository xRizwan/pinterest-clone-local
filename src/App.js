import React, {useEffect} from 'react';
import MainHeader from './Components/MainHeader';
import MainPage from './Components/MainPage';
import Header from './Components/Header';
import Settings from './Components/Settings';
import UserProfile from './Components/UserProfile';
import CreatePin from './Components/CreatePin';
import Main from './Components/Main';
import PinInfo from './Components/PinInfo';
import Following from './Components/Following';
import { useDispatch } from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {loginUser, logoutUser, setUid, resetUid} from './actions/';
import * as firebase from 'firebase/app';
import UserFollowing from './Components/UserFollowing';
import UserFollowers from './Components/UserFollowers';
import Search from './Components/Search';
import UserMessages from './Components/UserMessages';
import About from './Components/About';

function App() {

  // eslint-disable-next-line
  //const isLogged = useSelector(state => state.isLogged);
  //const uid = useSelector(state => state.userID)
  const dispatcher = useDispatch();

  useEffect(() => {
    let abortController = new AbortController();

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.

        // set loggedIn state to true
        console.log("login");
        dispatcher(loginUser());
        dispatcher(setUid(user.uid));

      } else {
        // No user is signed in.

        // set login state to false
        console.log("logout");
        dispatcher(logoutUser());
        dispatcher(resetUid());
      }
    });

    return () => {
      console.log('aborting app');
      abortController.abort();
    }
  }, [dispatcher, ])

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>

        {/* main path for user not logged in */}
        <Route exact path={'/'}>
          <MainHeader />
          <MainPage />
        </Route>

        <Route exact path={'/about'}>
          <About />
        </Route>
        
        {/* main path for user after logged in */}
        <Route path="/">
          <Header />
          <br />
          
          <Route exact path="/main">
            <Main />
          </Route>

          <Route exact path="/main/settings">
            <Settings />
          </Route>
          
          <Route exact path="/user/:userid">
            <UserProfile />
          </Route>

          <Route exact path="/user/:userid/following">
            <UserFollowing />
          </Route>

          <Route exact path="/user/:userid/followers">
            <UserFollowers />
          </Route>

          <Route exact path="/pin/:pinid">
            <PinInfo />
          </Route>

          <Route exact path="/create-a-pin">
            <CreatePin />
          </Route>

          <Route exact path="/search/:searchid">
            <Search />
          </Route>

          <Route exact path="/messages">
            <UserMessages />
          </Route>

          <Route exact path="/following">
            <Following />
          </Route>
        </Route>
        

      </Switch>
    </Router>
  );
}

export default App;