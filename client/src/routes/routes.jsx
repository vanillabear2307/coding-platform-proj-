import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from "../components/Main";
import Errorpage from "../components/Errorpage/Errorpage";
import Thanks from "../components/Thanks";
import Form from "../components/AddQuestion/Form";
import QuestionPage from "../components/QuestionPage/QuestionPage";
import Codingpage from "../components/Codingpage/Codingpage";
import profile from "../components/UserProfile/profile";
import Footer from "../components/Footer/Footer";
import "./routes.css";

const Routes = (props) => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route exact path="/thanks/:name" component={Thanks} />
        <Route exact path="/add" render={(routeProps) => <Form {...routeProps} authenticated={props.authenticated} user={props.user} />} />
        <Route exact path="/compete" render={(routeProps) => <QuestionPage {...routeProps} authenticated={props.authenticated} user={props.user} />} />
        <Route exact path="/codingpage/:id" render={(routeProps) => <Codingpage {...routeProps} authenticated={props.authenticated} user={props.user} />} />
        <Route exact path="/profile/:id" render={(routeProps) => {
          const ProfileComponent = profile;
          return <ProfileComponent {...routeProps} authenticated={props.authenticated} user={props.user} />;
        }} />
        <Route component={Errorpage} />
      </Switch>
      <Footer />
    </>
  );
};
export default Routes;
