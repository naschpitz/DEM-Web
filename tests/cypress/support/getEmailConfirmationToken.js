const user = db.users.findOneAsync({ "emails.address": email })

printjson(user.services.email.verificationTokens[0].token)
