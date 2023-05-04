import { createStepTrack } from "../queries/step.queries.js";
import { readFile } from "fs/promises";
import { checkEnigma } from "../routes/enigmaChecker.js";

const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);

// on charge les données correspondant à l'etape
function getPageData(step, url) {
  return {
    initialData: {
      name: data[step].name,
      linesToDisplay: data[step].initialLines,
      step: step,
      noTyping: data[step].noTyping,
      baseURL: url,
    },
  };
}

export const getFirstPage = async (req, res) => {
  await createStepTrack(0);
  res.render("pages/page", getPageData(0, req.app.locals.baseURL));
};

export const questionByPage = async (req, res) => {
  await createStepTrack(parseInt(req.params.page) || 0);
  //on recupere l'etape
  const currentStep = parseInt(req.params.page) || 0;
  if (currentStep === 0 || currentStep > data.length - 1) {
    res.redirect("/");
    return;
  }
  // ANTI TRICHE : on cheque si le cookie correspondant à l'etape est bien present, sinon on redirige
  const cookieStep = req.cookies["x-key"]
    ? data.findIndex((elem) => elem.key === req.cookies["x-key"])
    : 0;
  if (cookieStep < currentStep) {
    res.redirect("/" + cookieStep.toString());
    return;
  }
  // on renvoie la page
  res.render("pages/page", getPageData(currentStep, req.app.locals.baseURL));
};

export const checkQuestions = (req, res) => {
  // on recupere l'etape et la réponse envoyé par l'internaute
  const ret = checkEnigma(req);

  // si la reponse est correcte, on ajoute un cookie correspondant à l'etape dans la réponse
  if (ret.cookie) {
    res.cookie("x-key", ret.cookie);
  }
  res.status(201).json({
    message: ret.message,
    redirect: ret.redirect,
  });
};
