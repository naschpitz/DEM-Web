import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

export default class Users {
    static forceLogout(userId) {
        Meteor.users.update(
            userId,
            {
                $set: {
                    "services.resume.loginTokens": []
                }
            }
        );
    }

    static emailExists(email) {
        return !!this.getUserByEmail(email);
    }

    static getEmail(user) {
        let email = _.get(user, 'emails[0].address');

        if (email)
            return email;

        email = _.get(user, 'services.facebook.email');

        if (email)
            return email;

        email = _.get(user, 'services.google.email');

        if (email)
            return email;

        email = _.get(user, 'services.twitter.email');

        if (email)
            return email;
    }

    static getUserByEmail(email) {
        return Meteor.users.findOne(
            {
                $or: [
                    {'emails.address': email},
                    {'services.facebook.email': email},
                    {'services.google.email': email},
                    {'services.twitter.email': email},
                ]
            }
        );
    }

    static isVerified(user) {
        if (user.emails)
            return user.emails[0].verified

        else
            return true;
    }
}