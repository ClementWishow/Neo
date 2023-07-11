import { deleteLocalIp } from "../queries/sessionUser.queries.js";

// Les tests en local utilisent tous la même 'req.socket.remoteAdress" => ::1
// Puisque cette adresse est enregistrée à chaque utilisation, il faut supprimer en base après chaque test...
// le bouton qui déclenche ce endpoint est dispo sur la page administrators
export const deleteLocalTest = async (req, res) => {
    await deleteLocalIp('::1');
    res.status(201).json({});
};
  