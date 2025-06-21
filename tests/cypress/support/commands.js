// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("resetDatabase", () => {
  cy.exec('mongo mongodb://localhost:4001/meteor "tests/cypress/support/dbClean.js"').then(result => {
    cy.log(result)
  })
})

Cypress.Commands.add("registerUser", (email, password, confirmEmail) => {
  cy.get("#register").click()

  cy.get("input#inputEmail").type(email)
  cy.get("input#inputPassword").type(password)
  cy.get("input#inputPasswordCheck").type(password)

  cy.get("button#btnRegister").click()
  cy.contains(".alert-success", "successfully")

  cy.get("button#btnClose").click({ force: true })

  if (confirmEmail) cy.confirmEmail(email)
})

Cypress.Commands.add("login", (email, password) => {
  cy.get("#login").click()

  cy.get("input#inputEmail").type(email)
  cy.get("input#inputPassword").type(password)

  cy.get("button#btnLogin").click()

  cy.waitLogin()
})

Cypress.Commands.add("logout", () => {
  cy.get("li#userDropdown").click()
  cy.get("#logoutLink").click()

  cy.contains("logged out")

  cy.window().then(win => {
    // this allows accessing the window object within the browser
    const user = win.Meteor.user()

    expect(user).to.not.exist
  })
})

Cypress.Commands.add("waitLogin", () => {
  cy.contains("You're logged in")

  cy.window().then(win => {
    // this allows accessing the window object within the browser
    const user = win.Meteor.user()

    expect(user).to.exist
  })
})
