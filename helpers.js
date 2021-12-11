//=================function to check if user exists===============
const emailLookUp = (email, users) => {
    for (let user in users) {
        if (users[user]["email"] === email) {
            return { error: "Email Exists" };
        }
    }
    return { error: null };
};

//=================function to authenticate user info===================
const authenticateUserInfo = (email, password, users) => {
    if (email.trim() == "" || !email) {
        return { error: "Invalid Email" };
    }

    if (password.trim() == "" || !password) {
        return { error: "Invalid Password" };
    }

    const { error } = emailLookUp(email, users)

    if (error) {
        return { error: error };
    }

    return { error: null };
}

//=================function to retrieve user id=============
const getUserByEmail = (email, users) => {
    for (const key in users) {
        if (users[key].email === email) {
            return users[key];
        }
    }
};

//==================function to get urls owned by that user=====================
const urlsForUser = (ID, urlDatabase) => {
    const accessUrls = {};
    for (const url in urlDatabase) {
        if (urlDatabase[url].userID === ID) {
            accessUrls[url] = urlDatabase[url]
        }
    }
    return accessUrls;
};

//==============function to generate random string==================
function generateRandomString() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};



module.exports = { getUserByEmail, urlsForUser, generateRandomString, emailLookUp, authenticateUserInfo };

