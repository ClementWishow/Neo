import { readFile } from "fs/promises";
import { readFileSync } from "fs";
import { createUser, findUserById, updateUser } from "../queries/sessionUser.queries.js";
import { encrypt, decrypt } from "./encryptManager.js";
import { createEnigmeTracking, findEnigme, updateEnigmeTracking } from "../queries/enigmeTracking.queries.js";


const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);

let enigmesResultsByCandidat = [];

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}


export function createEnigmaPath() {
  const easy = getMultipleRandom(data.filter(x => x.tag === 'easy'), 2).map(x => x.name)
  const guess = getMultipleRandom(data.filter(x => x.tag === 'devinette'), 1).map(x => x.name)
  const medium = getMultipleRandom(data.filter(x => x.tag === 'medium'), 3).map(x => x.name)
  const hard = getMultipleRandom(data.filter(x => x.tag === 'hard'), 3).map(x => x.name)
  return ['begin', ...easy, ...guess,'eveille', ...medium, 'agent', ...hard, 'one']
}



export function getEnigmaData(name) {
  const enigma = data.find(x => x.name === name)
  if (!enigma) {
    return null
  }
  const ret = {
    initialLines: enigma.initialLines,
    noTyping: !!enigma.noTyping,
  }
  if (enigma.additionalHTML) {
    ret.additionalHTML = readFileSync(enigma.additionalHTML).toString()
  }
  if (enigma.additionalJS) {
    ret.additionalJS = readFileSync(enigma.additionalJS).toString()
  }
  if (enigma.blockedLetter) {
    ret.blockedLetter = enigma.blockedLetter
  }
  return ret
}

// fonction pour checker si l'espion a été eliminé
function checkSpyElimination(mutation) {
  if (mutation.deleted) {
    const deletedSpy = mutation.deleted.filter(
      (e) => e.id === "spy" && e.name == "PRE"
    );
    if (deletedSpy.length > 0) {
      return true;
    }
    if (
      mutation.modified &&
      mutation.modified.id === "spy" &&
      mutation.modified.name === "PRE" &&
      mutation.deleted.filter((e) => e.name === "#text").length > 0
    ) {
      return true;
    }
  }
  return false;
}

async function checkParticularity(stepData, req, ret) {
  const prompt = req.body.prompt ? req.body.prompt.toLowerCase() : null;
  switch (stepData.name) {
    case "begin":
      if (["non", "no"].includes(prompt)) {
        ret.message = stepData.alternateAnswer;
        ret.redirect = stepData.alternateLink;
      } else {
        ret.message = ret.correct ? stepData.goodAnswer : stepData.wrongAnswer;
      }
      break;
    case "spy":
      if (req.body.mutation && checkSpyElimination(req.body.mutation)) {
        ret.message = stepData.goodAnswer;
        ret.correct = true;
      }
      break;
    case "yellow":
      if (ret.correct && req.body.styles) {
        ret.correct =
          req.body.styles.color.replace(/\s/g, "") === "rgb(255,255,0)";
        if (
          !ret.correct &&
          req.body.styles.color.replace(/\s/g, "") != "rgb(51,208,17)"
        ) {
          ret.message =
            "Presque, mais on est plus sur du <div style='color: yellow'>jaune</div>";
        }
      }
      break;
    case "errorcode":
      ret.correct = prompt.includes(stepData.answer[0])
      break;
    case "eveille":
    case "agent":
      if (["bleu", "bleue", "pillule bleue"].includes(prompt) ) {
        ret.goToForm = true
        ret.message = stepData.alternateAnswer
      }
      break;
    case "one": 
      stepData =  data.find(x => x.name === 'endform')
    case "endform":
      let user = null
      if (req.body.try === 1) {
        user = await createUser(req.body.prompt);
        ret.cookie = encrypt(user._id.toString())
      }
      else {
        user = await findUserById(Buffer.from(decrypt(req.cookies["x-id"]).toString('hex')))
      }
      switch(req.body.try){
        case 2:
          user.email = prompt;
          break;
        case 3:
          user.stack = prompt;
          break;
        case 4:
          user.tel = prompt;
          break;
        case 5:
          user.remuneration = prompt;
          break;
        default:
          break;
      }
      user.mailSend = false;
      const indexResultByCandidat = enigmesResultsByCandidat.findIndex(result => result.ip === req.socket.remoteAddress);
      user.enigmesReussies = enigmesResultsByCandidat[indexResultByCandidat].enigmesReussies;
      user.enigmesFailed = enigmesResultsByCandidat[indexResultByCandidat].enigmesFailed;
      user = await updateUser(user);

      ret.message = stepData.alternateAnswer[Math.min(stepData.alternateAnswer.length - 1, req.body.try - 1)]

      if (req.body.try === stepData.alternateAnswer.length) {
        ret.redirect = "https://wishow.io/"
      }
      ret.correct = false
      break
    default:
        break;
  }
  if (prompt === "cheat") {
      ret.correct = true
  }
  return ret
}

export async function checkEnigma(name, req) {
  const stepData = data.find(x => x.name === name)

  // const step = parseInt(req.params.page) || 0;
  const prompt = req.body.prompt ? req.body.prompt.toLowerCase() : null;
  let ret = {
    message: "",
    redirect: null,
    cookie: null,
    correct: false,
  };
  // on verifie si la réponse est correcte en la comparant au JSON
  ret.correct = stepData.answer.includes(prompt);
  // gestion des cas particuliers propres à chaque etapes
  ret = await checkParticularity(stepData, req, ret);
  const enigme = await findEnigme(name);

  let indexResultByCandidat = enigmesResultsByCandidat.findIndex(result => result.ip === req.socket.remoteAddress);
  if(indexResultByCandidat === -1){
    const resultByIp = { 
      ip: req.socket.remoteAddress,
      enigmesReussies: [],
      enigmesFailed: []
    };
    enigmesResultsByCandidat.push(resultByIp);
    indexResultByCandidat = enigmesResultsByCandidat.length - 1;
  }

  // si la reponse est correcte , on renvoie une redirection vers l'etape suivante
  if (!ret.redirect && ret.correct) {
    ret.redirect = "next";
    enigmesResultsByCandidat[indexResultByCandidat].enigmesReussies.push(name);
    await recordEnigmeResult(enigme, name, true);
  }else {
    if(name !== 'endform'){
      enigmesResultsByCandidat[indexResultByCandidat].enigmesFailed.push(name);
      await recordEnigmeResult(enigme, name, false);
    }
  }
  // on renvoie le texte à affiché en cherchant dans le JSON
  if (!ret.message && !req.body.mutation) {
    ret.message = ret.correct ? stepData.goodAnswer : stepData.wrongAnswer
    if (!ret.correct && stepData.otherWrongs && req.body.try > 1) {
        ret.message = stepData.otherWrongs[Math.min(stepData.otherWrongs.length - 1, req.body.try - 2)]
    }
  }
  return ret;
}

async function recordEnigmeResult(enigme, name, result) {
  if(enigme.length > 0){
    if(result){
      enigme[0].numberReussie++
    }else {
      enigme[0].numberFailed++
    }
    await updateEnigmeTracking(enigme[0])
  }else {
    await createEnigmeTracking(name, result);
  }
}
