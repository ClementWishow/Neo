import enigmeTracking from "../models/enigmeTracking.js";

export const createEnigmeTracking = (enigme, reussie) => {
    if(reussie){
        return new enigmeTracking({
          name: enigme,
          numberReussie: 1,
          numberFailed: 0
        }).save();
    }else {
        return new enigmeTracking({
            name: enigme,
            numberReussie: 0,
            numberFailed: 1
        }).save();
    }
};

export const findEnigme = (enigme) => {
    return enigmeTracking.find({ name: enigme }).exec()
}

export const updateEnigmeTracking = (enigme) => {
    return enigmeTracking.findByIdAndUpdate({ _id: enigme._id }, enigme, {new: true});
}

export const findAllEnigmes = () => {
    return enigmeTracking.find({}).exec();
}