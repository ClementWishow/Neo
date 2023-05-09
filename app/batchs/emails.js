import cron from 'node-cron';
import { 
    getAllUsersToSendToRh, 
    updateUser 
} from '../queries/sessionUser.queries.js';
import { sendMailToRH } from '../emails/emails_candidat_to_rh.js';

// Every hours at minute 0
cron.schedule('0 * * * *', async () => {
    console.log("batch d'envoi des mails candidats aux RH");
    const users = await getAllUsersToSendToRh();
    users.forEach( async user => {
        sendMailToRH("mail_du_rh", user);
        user.mailSend = true;
        await updateUser(user);
    })
});