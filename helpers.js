const userAlreadyExist = (email,users) => {
    console.log(email);
    for (const key in users) {
        if (users[key].email === email) {
             return true;
        }
        }
        return false;
    }


    const urlsForUser = (userID, urlDatabase) => {
        const accessUrls = {};
        for (const url in urlDatabase) {
            if (urlDatabase[url].userID === userID.id) {
                accessUrls[url] = {
                    longURL: urlDatabase[url].longURL,
                    userID: userID
                };
            }
        } 
        return accessUrls;
    }
    


  module.exports = {userAlreadyExist, urlsForUser}; 

