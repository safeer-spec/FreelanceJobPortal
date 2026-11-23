const jwt = require("jsonwebtoken")

//invalid after 3 days
const maxAge = 3 *24 *60 *60

//user is default parameter
//id is both user and admin    //role is to define who logged in
const createToken = (id,role ="user") =>{
    return jwt.sign({id,role},process.env.JWT_SECRETE,{

    //check token is invalid
    expiresIn:maxAge
    })
    

}

module.exports = {createToken}