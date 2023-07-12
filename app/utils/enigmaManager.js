import { readFile } from "fs/promises";
import { readFileSync } from "fs";
import { findUserByIp, updateUser } from "../queries/sessionUser.queries.js";
import { createEnigmeTracking, findEnigme, updateEnigmeTracking } from "../queries/enigmeTracking.queries.js";


const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);

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

export function getEnigmes() {
  return data.filter(x => ["begin", "eveille", "agent", "one", "endform"].indexOf(x.name) === -1).map(x => x.name);
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
      let user = await findUserByIp(req.socket.remoteAddress);
      if (user.length > 0) {
        switch(req.body.try){
          case 1:
            user[user.length - 1].name = prompt;
            break;
          case 2:
            user[user.length - 1].email = prompt;
            user[user.length - 1].mailSend = false;
            break;
          case 3:
            user[user.length - 1].stack = prompt;
            break;
          case 4:
            user[user.length - 1].tel = prompt;
            break;
          case 5:
            user[user.length - 1].remuneration = prompt;
            break;
          default:
            break;
        }
        await updateUser(user[user.length - 1]);
      }

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

  if (req.body.mutation && !stepData.checkMutations) {
    return ret
  }
  // on verifie si la réponse est correcte en la comparant au JSON
  ret.correct = stepData.answer.includes(prompt);
  // gestion des cas particuliers propres à chaque etapes
  ret = await checkParticularity(stepData, req, ret);

  // si la reponse est correcte , on renvoie une redirection vers l'etape suivante
  if (!ret.redirect && ret.correct) {
    ret.redirect = "next";
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
