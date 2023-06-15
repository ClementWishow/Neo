import { readFile } from "fs/promises";
import { getEnigmaData, checkEnigma, createEnigmaPath } from "../utils/enigmaManager.js";
import { encrypt, decrypt } from "../utils/encryptManager.js";

const trame = JSON.parse(
  await readFile(new URL("../trame.json", import.meta.url))
);

export const getFirstPage = async (req, res) => {
  try {
    const cookie = req.cookies["x-key"]
    let stepName = 'begin';

      
    if (!cookie) {
      const journey = createEnigmaPath().join(';');
      res.cookie("x-key", encrypt(journey))
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
    res.cookie('x-key', encrypt(steps.join(';')));
  }
  res.status(201).json(ret);
};
