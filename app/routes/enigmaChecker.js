import { readFile } from "fs/promises";

const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);

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

function checkParticularity(stepData, req, ret) {
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
    case "end":
      ret.correct = true;
      const cookieStep = req.cookies["x-key"]
        ? data.findIndex((elem) => elem.key === req.cookies["x-key"])
        : 0;
      if (cookieStep < data.length - 1) {
        ret.message = "Bien tenté ! Mais non.";
        ret.redirect = req.app.locals.baseURL + cookieStep.toString();
      } else {
        ret.redirect = "https://meetings.hubspot.com/nbenhouidga";
      }
      break;
    default:
      break;
  }
  return ret;
}

export function checkEnigma(req) {
  const step = parseInt(req.params.page) || 0;
  const stepData = data[step];
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
  if (!ret.redirect) {
    ret.redirect = ret.correct
      ? req.app.locals.baseURL + (step + 1).toString()
      : null;
    ret.cookie = data[step + 1].key;
  }

  // on renvoie le texte à affiché en cherchant dans le JSON
  if (!ret.message && !req.body.mutation) {
    ret.message = ret.correct ? stepData.goodAnswer : stepData.wrongAnswer;
    if (!ret.correct && stepData.alternateAnswer && req.body.try > 1) {
      ret.message = stepData.alternateAnswer;
    }
  }
  return ret;
}
