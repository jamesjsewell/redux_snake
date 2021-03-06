const ROLE_MEMBER = require('./constants').ROLE_MEMBER;
const ROLE_CLIENT = require('./constants').ROLE_CLIENT;
const ROLE_OWNER = require('./constants').ROLE_OWNER;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

const sanitizeUser = function(userRecord){
    let userNoPW = {}
    
    for (var prop in (userRecord._doc || userRecord)) {
      if (prop !== 'password') userNoPW[prop] = userRecord._doc[prop]
    }

    return userNoPW
}

const updateFields = function(record, resBody){
  if (resBody.password) delete req.body.password

  for (var prop in resBody) {
    record[prop] = resBody[prop]
  }
  return record
}


// module.exports = {
//   sanitizeUser: sanitizeUser,
//   updateFields: updateFields
// }
//////////////////////////////

// Set user info from request
const setUserInfo = function setUserInfo(request) {
  const getUserInfo = {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role
  };

  return getUserInfo;
};

const getRole = function getRole(checkRole) {
  let role;

  switch (checkRole) {
    case ROLE_ADMIN: role = 4; break;
    case ROLE_OWNER: role = 3; break;
    case ROLE_CLIENT: role = 2; break;
    case ROLE_MEMBER: role = 1; break;
    default: role = 1;
  }

  return role;
};

module.exports = {
  setUserInfo: setUserInfo,
  getRole: getRole,
  sanitizeUser: sanitizeUser,
  updateFields: updateFields
}