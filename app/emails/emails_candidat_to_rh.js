import nodeMailer from 'nodemailer';
import { pugEngine } from "nodemailer-pug-engine";

const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "vincent.darcqf78@gmail.com",
        pass: "ilhkphhzemiobzua"
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.use('compile', pugEngine({
    templateDir: process.cwd() + './templates',
    pretty: true
}));

let mailOptions = (to, subject, template, context) => {
    return {
        from: '"Neo" <vincent.darcqf78@gmail.com>',
        to: to,
        subject: subject,
        template: template,
        ctx: context
    };
}

let ctx = {
}

export const sendMailToRH = (to, user) => {
    ctx.candidatName = user.name;
    ctx.candidatMail = user.mail;
    ctx.candidatStack = user.stack;
    ctx.candidatTel = user.tel;
    let options = mailOptions(to, "candidature", 'contactRH', ctx);

    transporter.sendMail(options, (error, info) => {
        if (error) {
        console.log(error);
        return res.status(500).json(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.status(200).json(mail_sent_successfully);
    });
}