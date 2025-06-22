import { Meteor } from "meteor/meteor"
import React from "react"
import { useTracker } from "meteor/react-meteor-data"

import Users from "../../../api/users/both/class.js"

import Alert from "../../utils/alert.js"
import { Link } from "react-router-dom"
import { UniqueModalController } from "@naschpitz/unique-modal"

import ChangePassword from "../user/changePassword/changePassword.jsx"
import Login from "../user/login/login.jsx"
import Register from "../user/register/register.jsx"
import ResetPassword from "../user/resetPassword/resetPassword.jsx"

import { FaSignInAlt, FaPlus, FaSignOutAlt, FaSyncAlt, FaKey, FaDesktop, FaServer } from "react-icons/fa"

import "./navbar.css"

const Navbar = props => {
  const currentUser = useTracker(() => Meteor.user())

  if (!!Session.get("passwordResetToken")) {
    UniqueModalController.open(<ResetPassword onDone={onModalClose} />)
  }

  function getLeftItems() {
    return (
      <React.Fragment>
        <li className="nav-item">
          <Link className="nav-link" id="inventory" to="/simulations">
            <FaDesktop className="align-middle" /> Simulations
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" id="backpack" to="/servers">
            <FaServer className="align-middle" /> Servers
          </Link>
        </li>
      </React.Fragment>
    )
  }

  function getRightItems() {
    return (
      <React.Fragment>
        {loginButton()}

        {!currentUser ? (
          <React.Fragment>
            <li className="nav-item">
              <Link className="nav-link" id="register" to="#" onClick={onRegisterClick}>
                <FaPlus className="align-middle" /> Register
              </Link>
            </li>

            {Session.get("passwordResetToken") ? (
              <li className="nav-item">
                <Link className="nav-link" id="resetPassword" to="#">
                  <FaSyncAlt className="align-middle" /> Reset Password
                </Link>
              </li>
            ) : null}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    )
  }

  function loginButton() {
    if (currentUser) {
      const displayName = Users.getEmail(currentUser)
      const verified = Users.isVerified(currentUser)

      return (
        <li className="nav-item dropdown" id="userDropdown">
          <Link
            key="username"
            className="nav-link dropdown-toggle"
            id="username"
            to="#"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {displayName}
          </Link>

          <div className="dropdown-menu" aria-labelledby="userDropdown">
            <Link className="dropdown-item" id="changePasswordLink" to="#" onClick={onChangePasswordClick}>
              <FaKey className="align-middle" /> Change Password
            </Link>
            {!verified ? (
              <Link className="dropdown-item" id="confirmEmailLink" to="#" onClick={onConfirmEmailClick}>
                <FaSyncAlt className="align-middle" /> Re-send Confirmation
              </Link>
            ) : null}
            <Link className="dropdown-item" id="logoutLink" to="#" onClick={onLogoutClick}>
              <FaSignOutAlt className="align-middle" /> Logout
            </Link>
          </div>
        </li>
      )
    } else {
      return (
        <li className="nav-item" id="login">
          <Link key="login" className="nav-link" id="loginLink" to="#" onClick={onLoginClick}>
            <FaSignInAlt className="align-middle" /> Login
          </Link>
        </li>
      )
    }
  }

  function onLoginClick() {
    UniqueModalController.open(<Login onDone={onModalClose} />)
  }

  function onRegisterClick() {
    UniqueModalController.open(<Register onDone={onModalClose} />)
  }

  function onChangePasswordClick() {
    UniqueModalController.open(<ChangePassword onDone={onModalClose} />)
  }

  function onModalClose() {
    UniqueModalController.close()
  }

  function onConfirmEmailClick() {
    Meteor.callAsync("users.sendVerificationEmail")

    Alert.success("A confirmation e-mail has been sent to you.")
  }

  function onLogoutClick() {
    // Speeds up logout process.
    Meteor._localStorage.removeItem("Meteor.loginToken")
    Meteor._localStorage.removeItem("Meteor.loginTokenExpires")
    Meteor._localStorage.removeItem("Meteor.userId")

    Meteor.logout()
  }

  return (
    <nav id="navbar" className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">
        DEM
      </a>

      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarMainContent"
        aria-controls="navbarMainContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarMainContent">
        <ul className="navbar-nav mr-auto">{getLeftItems()}</ul>

        <ul className="navbar-nav ml-auto">{getRightItems()}</ul>
      </div>
    </nav>
  )
}

export default Navbar
