import { findAllEnigmes } from "../queries/enigmeTracking.queries.js";
import { getAllCandidats } from "../queries/sessionUser.queries.js";

export const getDashboard = async (req, res) => {
    try {
      const enigmes = await findAllEnigmes();
      const candidats = await getAllCandidats();
      let candidatsFinal = [];
      candidats.forEach(c => {
        if(c.name){
          candidatsFinal.push(c);
        }
      })
      res.render("pages/dashboard", { enigmes: enigmes, candidats: candidats, candidatsFinal: candidatsFinal});
    }catch(e){
      res.status(500).json(e);
    }
  }