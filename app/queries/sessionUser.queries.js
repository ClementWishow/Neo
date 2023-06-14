import sessionUser from "../models/sessionUser.js";

export const createUser = (ip) => {
  return new sessionUser({
    ip: ip
  }).save();
};

export const findUserById = (id) => {
    return sessionUser.findById(id).exec();
}

export const findUserByIp = (ip) => {
    return sessionUser.find({ ip: ip}).exec();
}

export const updateUser = (user) => {
    return sessionUser.findByIdAndUpdate({ _id: user._id }, user, {new: true});
}

export const getAllUsersToSendToRh = () => {
    return sessionUser.find({ mailSend: false }).exec();
}

export const getAllCandidats = () => {
  return sessionUser.find({}).exec();
}