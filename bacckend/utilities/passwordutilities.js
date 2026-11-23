const bcrypt = require("bcrypt");

const hashPassword = async (password) => {

  //salt creating
  const salt = await bcrypt.genSalt(10);

  //connecting password and salt
  const hashedPassword = await bcrypt.hash(password, salt);
  
  return hashedPassword;
};


//compare register password when log in with the password
const comparePassword = async ( password,hashPassword) =>{
const passwordMatch  = await bcrypt.compare(password,hashPassword)
return passwordMatch
}

module.exports = { hashPassword, comparePassword };