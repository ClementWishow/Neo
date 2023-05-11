import sessionUser from "../models/sessionUser.js";

export const createUser = (userName) => {
  return new sessionUser({
    name: userName
  }).save();
};

export const findUserById = (id) => {
    return sessionUser.findById(id).exec();
}

export const updateUser = (user) => {
    return sessionUser.findByIdAndUpdate({ _id: user._id }, user, {new: true});
}

export const getAllUsersToSendToRh = () => {
    return sessionUser.find({ mailSend: false }).exec();
}