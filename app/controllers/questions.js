import { readFile } from "fs/promises";
import { getEnigmaData, checkEnigma, createEnigmaPath, isFirstFiveFailedReached, isLastThreeFailedReached } from "../utils/enigmaManager.js";
import { encrypt, decrypt } from "../utils/encryptManager.js";

const trame = JSON.parse(
  await readFile(new URL("../trame.json", import.meta.url))
);

export const getFirstPage = async (req, res) => {
  try {
    const cookie = req.cookies["x-key"]
    let stepName = 'begin';

    const journey = createEnigmaPath();
      
    if (!cookie) {
      res.cookie("x-key", encrypt(journey.join(';')))
    }
    else {
      stepName = decrypt(req.cookies["x-key"]).split(';')[0]
    }
    res.render("pages/page", { initialData: getEnigmaData(stepName), baseURL: req.app.locals.baseURL});
  }catch(e){
    res.status(500).json(e);
  }
};

export const checkQuestions = async (req, res) => {
  // on recupere l'etape et la réponse envoyé par l'internaute
  let steps = decrypt(req.cookies["x-key"]).split(';')
  const result = await checkEnigma(steps[0], req);

  const ret = {
    message: result.message,
    redirect: result.redirect,
  }

  if (result.cookie) {
    res.cookie('x-id', result.cookie)
  }
  console.log(result)
  // si la reponse est correcte, on modifie le cookie x-key pour passer à l'etape suivante
  if (result.redirect === 'next') {
    steps.shift()
    if (result.goToForm) {
      steps = ['endform', ...steps]
    }
    console.log(steps)
    ret.nextData = getEnigmaData(steps[0])
    const index = 12 - steps.length
    if (index < trame.length && trame[index].length > 0) {
      ret.nextData.initialLines = [...trame[index], ...ret.nextData.initialLines]   
    }
    res.cookie('x-key', encrypt(steps.join(';')));
  }else {
    if(isFirstFiveFailedReached(req.socket.remoteAddress)){
      steps = ['firstFiveFails', ...steps]
      ret.message = "Ce n'est toujours pas ça."
      ret.redirect = "next";
      ret.nextData = getEnigmaData(steps[0])
      res.cookie('x-key', encrypt(steps.join(';')));
    }else if(isLastThreeFailedReached(req.socket.remoteAddress)){
      steps = ['lastThreeFails', ...steps]
      ret.message = "Je suis désolé mais non."
    }
  }
  res.status(201).json(ret);
};
