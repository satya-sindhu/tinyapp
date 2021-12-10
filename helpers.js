const userAlreadyExist = (email,users) => {
    console.log(email);
    for (const key in users) {
        if (users[key].email === email) {
             return true;
        }
        }
        return false;
    }
    


  module.exports = {userAlreadyExist}; 

