import { findAllEnigmes } from "../queries/enigmeTracking.queries.js";
import { getAllCandidats } from "../queries/sessionUser.queries.js";

export const getCandidatsContacts = async (req, res) => {
  const candidats = await getAllCandidats();
  let candidatsFinal = [];
  candidats.forEach(c => {
    if(c.name){
      candidatsFinal.push(c);
    }
  });
  res.render("pages/dashboard_candidats_contacts", {
    candidatsFinal: candidatsFinal,
  });
}

export const getDashboard = async (req, res) => {
    try {
      const enigmes = await findAllEnigmes();
      const candidats = await getAllCandidats();
      let visitsDates = {}
      const joursSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      let today;
      let eveille = 0;
      let agent = 0;
      let elu = 0;
      let candidatsFinal = [];
      candidats.forEach(c => {
        if(c.name){
          candidatsFinal.push(c);
        }
        if(c.badges.indexOf("eveille") !== -1){
          eveille++;
        }
        if(c.badges.indexOf("agent") !== -1){
          agent++;
        }
        if(c.badges.indexOf("one") !== -1){
          elu++;
        }
        today = new Date();
        const visitCandidatDate = new Date(c.createdAt);
        const days = (today.getTime() - visitCandidatDate.getTime())/1000/3600/24;
        if(days < 1){
          if(!visitsDates[joursSemaine[today.getDay()]]){
            visitsDates[joursSemaine[today.getDay()]] = 1;
          }else {
            visitsDates[joursSemaine[today.getDay()]]++
          }
        }else if(days >= 1 && days < 2){
          if(!visitsDates[today.getDay()-1 < 0 ? joursSemaine[7 + (today.getDay()-1)] : joursSemaine[today.getDay()-1]]){
            visitsDates[today.getDay()-1 < 0 ? joursSemaine[7 + (today.getDay()-1)] : joursSemaine[today.getDay()-1]] = 1;
          }else {
            visitsDates[today.getDay()-1 < 0 ? joursSemaine[7 + (today.getDay()-1)] : joursSemaine[today.getDay()-1]]++
          }
        }else if(days >= 2 && days < 3){
          if(!visitsDates[today.getDay()-2 < 0 ? joursSemaine[7 + (today.getDay()-2)] : joursSemaine[today.getDay()-2]]){
            visitsDates[today.getDay()-2 < 0 ? joursSemaine[7 + (today.getDay()-2)] : joursSemaine[today.getDay()-2]] = 1;
          }else {
            visitsDates[today.getDay()-2 < 0 ? joursSemaine[7 + (today.getDay()-2)] : joursSemaine[today.getDay()-2]]++
          }
        }else if(days >= 3 && days < 4){
          if(!visitsDates[today.getDay()-3 < 0 ? joursSemaine[7 + (today.getDay()-3)] : joursSemaine[today.getDay()-3]]){
            visitsDates[today.getDay()-3 < 0 ? joursSemaine[7 + (today.getDay()-3)] : joursSemaine[today.getDay()-3]] = 1;
          }else {
            visitsDates[today.getDay()-3 < 0 ? joursSemaine[7 + (today.getDay()-3)] : joursSemaine[today.getDay()-3]]++
          }
        }else if(days >= 4 && days < 5){
          if(!visitsDates[today.getDay()-4 < 0 ? joursSemaine[7 + (today.getDay()-4)] : joursSemaine[today.getDay()-4]]){
            visitsDates[today.getDay()-4 < 0 ? joursSemaine[7 + (today.getDay()-4)] : joursSemaine[today.getDay()-4]] = 1;
          }else {
            visitsDates[today.getDay()-4 < 0 ? joursSemaine[7 + (today.getDay()-4)] : joursSemaine[today.getDay()-4]]++
          }
        }else if(days >= 5 && days < 6){
          if(!visitsDates[today.getDay()-5 < 0 ? joursSemaine[7 + (today.getDay()-5)] : joursSemaine[today.getDay()-5]]){
            visitsDates[today.getDay()-5 < 0 ? joursSemaine[7 + (today.getDay()-5)] : joursSemaine[today.getDay()-5]] = 1;
          }else {
            visitsDates[today.getDay()-5 < 0 ? joursSemaine[7 + (today.getDay()-5)] : joursSemaine[today.getDay()-5]]++
          }
        }else if(days >= 6 && days < 7){
          if(!visitsDates[today.getDay()-6 < 0 ? joursSemaine[7 + (today.getDay()-6)] : joursSemaine[today.getDay()-6]]){
            visitsDates[today.getDay()-6 < 0 ? joursSemaine[7 + (today.getDay()-6)] : joursSemaine[today.getDay()-6]] = 1;
          }else {
            visitsDates[today.getDay()-6 < 0 ? joursSemaine[7 + (today.getDay()-6)] : joursSemaine[today.getDay()-6]]++
          }
        }else if(days >= 7 && days < 14){
          today.setDate(today.getDate() - 14)
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }else if(days >= 14 && days < 21){
          today.setDate(today.getDate() - 21);
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }else if(days >= 21 && days < 28){
          today.setDate(today.getDate() - 28);
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }else if(days >= 28 && days < 35){
          today.setDate(today.getDate() - 35);
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }else if(days >= 35 && days < 42){
          today.setDate(today.getDate() - 42);
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }else if(days >= 42 && days < 49){
          today.setDate(today.getDate() - 49);
          if(!visitsDates[`${today.getDay()}/${today.getMonth()}`]){
            visitsDates[`${today.getDay()}/${today.getMonth()}`] = 1;
          }else {
            visitsDates[`${today.getDay()}/${today.getMonth()}`]++;
          }
        }
      });
      let semaine_1 = new Date()
      semaine_1.setDate(semaine_1.getDate() - 14);
      let semaine_2 = new Date()
      semaine_2.setDate(semaine_2.getDate() - 21);
      let semaine_3 = new Date()
      semaine_3.setDate(semaine_3.getDate() - 28);
      let semaine_4 = new Date()
      semaine_4.setDate(semaine_4.getDate() - 35);
      let semaine_5 = new Date()
      semaine_5.setDate(semaine_5.getDate() - 42);
      let semaine_6 = new Date()
      semaine_6.setDate(semaine_6.getDate() - 49);
      const semaines = [
        `${semaine_1.getDate()}/${semaine_1.getMonth()+1}`,
        `${semaine_2.getDate()}/${semaine_2.getMonth()+1}`,
        `${semaine_3.getDate()}/${semaine_3.getMonth()+1}`,
        `${semaine_4.getDate()}/${semaine_4.getMonth()+1}`,
        `${semaine_5.getDate()}/${semaine_5.getMonth()+1}`,
        `${semaine_6.getDate()}/${semaine_6.getMonth()+1}`,
      ]
      const days = [ 
        joursSemaine[today.getDay()],
        today.getDay()-1 < 0 ? joursSemaine[7 + (today.getDay()-1)] : joursSemaine[today.getDay()-1], 
        today.getDay()-2 < 0 ? joursSemaine[7 + (today.getDay()-2)] : joursSemaine[today.getDay()-2],
        today.getDay()-3 < 0 ? joursSemaine[7 + (today.getDay()-3)] : joursSemaine[today.getDay()-3],
        today.getDay()-4 < 0 ? joursSemaine[7 + (today.getDay()-4)] : joursSemaine[today.getDay()-4],
        today.getDay()-5 < 0 ? joursSemaine[7 + (today.getDay()-5)] : joursSemaine[today.getDay()-5],
        today.getDay()-6 < 0 ? joursSemaine[7 + (today.getDay()-6)] : joursSemaine[today.getDay()-6]
      ]
      res.render("pages/dashboard", {
        enigmes: enigmes, 
        candidats: candidats, 
        visitsDates: visitsDates,
        days: days,
        semaines: semaines,
        eveille: eveille,
        agent: agent,
        elu: elu,
        candidatsFinal: candidatsFinal,
      });
    }catch(e){
      console.log(e)
      res.status(500).json(e);
    }
}