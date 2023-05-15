import cron from 'node-cron';
import { 
    getAllUsersToSendToRh, 
    updateUser 
} from '../queries/sessionUser.queries.js';
import { sendMailToRH } from '../emails/emails_candidat_to_rh.js';

// Every hours at minute 0
cron.schedule('0 * * * *', async () => {
    console.log("batch d'envoi des mails candidats au CTO");
    const users = await getAllUsersToSendToRh();
    users.forEach( async user => {
        sendMailToRH("olivier.bazin@wishow.io", user);
        sendMailToRH("vincent.darcq@wishow.io", user);
        sendMailToRH("mike.dorival@wishow.io", user);
        user.mailSend = true;
        await updateUser(user);
    })
});