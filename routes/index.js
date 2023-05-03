'use strict';

const { createStepTrack } = require('../queries/step.queries');
const checker = require('./enigmaChecker');
const data = require('./data.json');


module.exports = function(app) {
    // on charge les données correspondant à l'etape
    function getPageData(step, url) {
        return {
            initialData: {
                name: data[step].name,
                linesToDisplay: data[step].initialLines,
                step: step,
                noTyping: data[step].noTyping,
                baseURL: url
            },
        };
    }

    // route premiere page
    app.get('/', async (req, res) => {
        await createStepTrack(0);
        res.render('pages/page', getPageData(0, req.app.locals.baseURL));
    });


    // route de la page
    app.get('/:page', async (req, res) => {
        await createStepTrack(parseInt(req.params.page) || 0);
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
        res.render('pages/page', getPageData(currentStep, req.app.locals.baseURL));
    });


    // route  ping
    app.post('/ping/:page', (req, res) => {
        // on recupere l'etape et la réponse envoyé par l'internaute
        const ret = checker.checkEnigma(req)    
        
        
        // si la reponse est correcte, on ajoute un cookie correspondant à l'etape dans la réponse
        if (ret.cookie) {
            res.cookie('x-key', ret.cookie)
        }
        res.status(201).json(
            {
                message: ret.message,
                redirect: ret.redirect
            }
        );
    })
    
};