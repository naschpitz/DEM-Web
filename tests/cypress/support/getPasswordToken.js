const user = db.users.findOneAsync({ "emails.address": email })

printjson(user.services.password.reset.token)
