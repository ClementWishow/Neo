import { readFile } from "fs/promises";
import { readFileSync } from "fs";
import { createUser, findUserById, updateUser } from "../queries/sessionUser.queries.js";

const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);



function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}


export function createEnigmaPath() {
  const easy = getMultipleRandom(data.filter(x => x.tag === 'easy'), 3).map(x => x.name)
  const medium = getMultipleRandom(data.filter(x => x.tag === 'medium'), 3).map(x => x.name)
  const hard = getMultipleRandom(data.filter(x => x.tag === 'hard'), 3).map(x => x.name)
  return ['begin', ...easy, 'eveille', ...medium, 'agent', ...hard, 'one']
}



export function getEnigmaData(name) {
  const enigma = data.find(x => x.name === name)
  if (!enigma) {
    return null
  }
  const ret = {
    initialLines: enigma.initialLines,
    noTyping: !!enigma.noTyping,
    name: enigma.name,
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
  console.log(ret.initialLines)
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
      let user;
      if(req.body.try === 1){
        user = await createUser(req.body.prompt);
        //TODO: récupérer le champs user._id et le stocker en cookie "userId"
      }else {
        //TODO : récupérer le cookie "userId" et findUserById la value
        user = await findUserById("123456");
        switch(req.body.try){
          case 2:
            user.email = req.body.prompt;
            break;
          case 3:
            user.tel = req.body.prompt;
            break;
          case 4:
            user.stack = req.body.prompt;
            break;
          default:
            break;
        }
        user.mailSend = false;
        user = await updateUser(user);
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

export function checkEnigma(name, req) {
  const stepData = data.find(x => x.name === name)

  // const step = parseInt(req.params.page) || 0;
  const prompt = req.body.prompt ? req.body.prompt.toLowerCase() : null;
  let ret = {
    message: "",
    redirect: null,
    cookie: false,
    correct: false,
  };

  // on verifie si la réponse est correcte en la comparant au JSON
  ret.correct = stepData.answer.includes(prompt);

  // gestion des cas particuliers propres à chaque etapes
  ret = checkParticularity(stepData, req, ret);

  // si la reponse est correcte , on renvoie une redirection vers l'etape suivante
  if (!ret.redirect && ret.correct) {
    ret.redirect = "next"
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
