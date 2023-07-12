import { readFile } from "fs/promises";
import { getEnigmaData, checkEnigma, createEnigmaPath } from "../utils/enigmaManager.js";
import { encrypt, decrypt } from "../utils/encryptManager.js";
import { createUser, findUserByIp, updateUser  } from "../queries/sessionUser.queries.js";

const trame = JSON.parse(
  await readFile(new URL("../trame.json", import.meta.url))
);

export const getFirstPage = async (req, res) => {
  try {
    let stepName = 'begin';
    const user = await findUserByIp(req.socket.remoteAddress)
    if (user.length > 0 && req.cookies['x-key']) {
      stepName = decrypt(req.cookies['x-key']).split(';')[0];
    } else {
      let userPath = createEnigmaPath()
      await createUser(req.socket.remoteAddress, userPath)
      res.cookie("x-key", encrypt(userPath.join(';')))
    }
    res.render("pages/page", { initialData: getEnigmaData(stepName), baseURL: req.app.locals.baseURL});
  }catch(e){
    console.log(e)
    res.status(500).json(e);
  }
};

export const checkQuestions = async (req, res) => {
  try {
    // on recupere l'etape et la réponse envoyé par l'internaute
    let steps = decrypt(req.cookies["x-key"]).split(';')
    const result = await checkEnigma(steps[0], req);
    const user = await findUserByIp(req.socket.remoteAddress);
  
    const ret = {
      message: result.message,
      redirect: result.redirect,
    }
    if (user.length > 0 && (steps[0] !== "begin" || steps[0] !== "endform")) {
      user[user.length - 1].path.push(`${steps[0]}${result.redirect === 'next' ? "-success" : "-failed"}`)
    }
    // si la reponse est correcte, on ajoute un cookie correspondant à l'etape dans la réponse
    if (result.redirect === 'next') {
      steps.shift()
      if (result.goToForm) {
        steps = ['endform', ...steps]
      }
      ret.nextData = getEnigmaData(steps[0])
      const index = 12 - steps.length
      if (index < trame.length && trame[index].length > 0) {
        ret.nextData.initialLines = [...trame[index], ...ret.nextData.initialLines]   
      }
      user[user.length - 1].path.push(steps[0])
      res.cookie('x-key', encrypt(steps.join(';')));
    }
    await updateUser(user[user.length - 1])
    res.status(201).json(ret);
  }catch(e){
    console.log(e)
    res.status(500).json(e);
  }
};
