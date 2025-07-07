import { Meteor } from "meteor/meteor"

import Users from "../both/class"

if (Meteor.isServer) {
  Meteor.methods({
    async "users.getUserByEmail"(email) {
      return await Meteor.users.findOneAsync({
        "emails.address": email,
      })
    },

    async "users.getUserById"(id) {
      return await Meteor.users.findOneAsync(id)
    },

    async "users.sendVerificationEmail"() {
      if (this.userId && Meteor.isServer) Accounts.sendVerificationEmail(this.userId)
    },

    async "users.create"(options) {
      const userId = await Accounts.createUserAsync(options)

      if (userId) Accounts.sendVerificationEmail(userId)
    },

    async "users.invite"(email) {
      if (!this.userId) throw new Meteor.Error("401", "Unauthorized", "User not logged in.")

      const options = {
        email: email,
      }

      const userFound = await Meteor.callAsync("users.getUserByEmail", email)

      if (userFound) throw new Meteor.Error("403", "There is already an user registered with this e-mail address.")

      let userId = null

      if (userFound) userId = userFound._id
      else userId = await Accounts.createUserAsync(options)

      if (userId) Accounts.sendEnrollmentEmail(userId)
      else throw new Meteor.Error("500", "Error creating user.")

      return true
    },

    async "users.resendInvitation"(userId) {
      if (!this.userId) throw new Meteor.Error("401", "Unauthorized", "User not logged in.")

      const userFound = await Meteor.users.findOneAsync(userId)

      if (!userFound) throw new Meteor.Error("403", "Forbidden", "User not found.")

      if (Users.isVerified(userFound))
        throw new Meteor.Error("500", "Cannot resend invitation to an already verified user.")

      Accounts.sendEnrollmentEmail(userId)
    },
  })
}
