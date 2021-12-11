const getUserByEmail = (email,users) => {
    console.log(email);
    for (const key in users) {
        if (users[key].email === email) {
             return users[key];
        }
        }
        return false;
    };


    const urlsForUser = (ID, urlDatabase) => {
        const accessUrls = {};
        for (const url in urlDatabase) {
            if (urlDatabase[url].userID === ID) {
                accessUrls[url] = urlDatabase[url]

                //     longURL: urlDatabase[url].longURL ,
                //     userID: userID
                // };
            }
        } 
        return accessUrls;
    };

    function generateRandomString() {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 6; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    };
    


  module.exports = {getUserByEmail, urlsForUser, generateRandomString}; 

