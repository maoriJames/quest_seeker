import React from 'react'
import { Navigate } from 'react-router-dom'
// import ReactDOM from "react-dom/client";
// import App from "../App.tsx";
import '../index.css'
// import { Amplify } from "aws-amplify";
// import outputs from "../amplify_outputs.json";

// Amplify.configure(outputs);

const IndexPage = () => {
  console.log('Main page running?')
  // if (loading || isLoading) {
  //   return <div>Loading...</div>; // simple spinner
  // }

  // if (!session) {
  //   return <Navigate to="/sign-in" />;
  // }

  // if (!isAdmin && profile) {
  return <Navigate to="/user" />
  // }

  // if (isAdmin && profile) {
  //   return <Navigate to="/admin" />;
  // }

  return <div>This is the main page!</div> // nothing to render while waiting
}

export default IndexPage
