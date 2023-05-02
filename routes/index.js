'use strict';

const { 
    createStepTrack, 
    clickOnFirstPage 
} = require('../queries/step.queries');
const data = require('./data.json');
const baseURL = process.env.BASE_URL || 'http://localhost:3000/'

module.exports = function(app) {
    // on charge les données correspondant à l'etape
    console.log('in route ', process.env.BASE_URL)
    function getPageData(step) {
        return {
            initialData: {
                linesToDisplay: data[step].initialLines,
                step: step,
                noTyping: data[step].noTyping,
                baseURL: baseURL
            },
            help: step === 5 ? "64" : "NO HELP",
            withSpy: step === 1
        };
    }

    // route premiere page
    app.get('/:user', async (req, res) => {
        const user = req.params.user;
        if(user !== "favicon.ico"){
            await clickOnFirstPage(req.params.user);
        }
        res.render('pages/page', getPageData(0));
    });


    // route de la page
    app.get('/:page', function(req, res) {
        //on recupere l'etape
        const currentStep = parseInt(req.params.page) || 0
        if (currentStep === 0 || currentStep > data.length - 1) {
            res.redirect('/');
            return
        }
        // ANTI TRICHE : on cheque si le cookie correspondant à l'etape est bien present, sinon on redirige
        var cookieStep = req.cookies['x-key'] ? data.findIndex(elem => elem.key === req.cookies['x-key']) : 0;
        if (cookieStep < currentStep) {
            res.redirect('/' + cookieStep.toString());
            return
        }
        // on renvoie la page
        res.render('pages/page', getPageData(currentStep));
    });

    // fonction pour checker si l'espion a été eliminé
    function checkSpyElimination(mutation) {
       if (mutation.deleted) {
            const deletedSpy = mutation.deleted.filter(e => e.id === 'spy' && e.name == "PRE")
            if (deletedSpy.length > 0) {
                return true
            }
            if (mutation.modified && mutation.modified.id === 'spy' && mutation.modified.name === "PRE" &&
                mutation.deleted.filter(e => e.name === "#text").length > 0) {
                    return true
                }
       }
       return false
    }

    // route  ping
    app.post('/ping/:page', async (req, res) => {
        await createStepTrack(parseInt(req.params.page) || 0);
        // on recupere l'etape et la réponse envoyé par l'internaute
        const step = parseInt(req.params.page) || 0
        var answer = req.body.prompt ? req.body.prompt.toLowerCase() : null
        var ret = {
            message : "",
            redirect : null
        }


        // on verifie si la réponse est correcte en la comparant au JSON
        var allGood = data[step].answer.includes(answer)

        // gestion des cas particuliers propres à chaque etapes
        switch (step) {
            case 0:
                if (["non", "no"].includes(answer)) {   
                    ret.message = data[step].alternateAnswer
                    ret.redirect = data[step].alternateLink
                }
                else {
                    ret.message = allGood ? data[step].goodAnswer : data[step].wrongAnswer
                }
              break;
            case 1:
                allGood = req.body.mutation && checkSpyElimination(req.body.mutation)
                answer = "ok"
                break;
            case 4:
                allGood = allGood && req.body.styles.color.replace(/\s/g, '') === "rgb(255,255,0)"
                if (!allGood && req.body.styles.color.replace(/\s/g, '') != "rgb(51,208,17)") {
                    ret.message = "Presque, mais on est plus sur du <div style='color: yellow'>jaune</div>"
                }
                break;
            case data.length - 1:
                allGood = true
                var cookieStep = req.cookies['x-key'] ? data.findIndex(elem => elem.key === req.cookies['x-key']) : 0
                if (cookieStep < 7) {
                    ret.message = "Bien tenté ! Mais non."
                    ret.redirect = baseURL + cookieStep.toString();
                }
                else {
                    ret.redirect = "https://meetings.hubspot.com/nbenhouidga"
                }
                break;
            default:
                break;
          }


        // si la reponse est correcte , on renvoie une redirection vers l'etape suivante
        if (!ret.redirect && answer) {
            ret.redirect = allGood ? baseURL + (step + 1).toString() : null
        }

        // on renvoie le texte à affiché en cherchant dans le JSON
        if (!ret.message && answer) {
            ret.message = allGood ? data[step].goodAnswer : data[step].wrongAnswer
            if (!allGood && data[step].alternateAnswer && req.body.try > 1) {
                ret.message = data[step].alternateAnswer
            }
        }
        
        // si la reponse est correcte, on ajoute un cookie correspondant à l'etape dans la réponse
        if (allGood && step < 7) {
            res.cookie('x-key', data[step + 1].key)
        }
        res.status(201).json(ret);
    })
    
};