const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    /**
     * 
     * @param {string} toEmailAddress Email address to which the email has to be sent
     * @param {string} toUserFirstName First name of the user to whom the email has to be sent
     * @param {string} url The complete url to be sent alongside the email for further processing (if required)
     */
    constructor(toEmailAddress, toUserFirstName, url) {
        this.toEmailAddress = toEmailAddress;
        this.toUserFirstName = toUserFirstName;
        this.url = url;
        this.from = `Audiofy <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: process.env.AWS_SES_HOST,
                port: process.env.AWS_SES_PORT,
                auth: {
                    user: process.env.AWS_SES_USER,
                    pass: process.env.AWS_SES_PASS
                }
            });
        }
        
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async send(templateName, subject) {
        // 1)Render the html based pug template.
        const html = pug.renderFile(`${__dirname}/../views/email/${templateName}.pug`, {
            firstName: this.toUserFirstName,
            url: this.url,
            subject,
        });

        // 2)Create mail options for the nodemailer.
        const mailOptions = {
            from: this.from,
            to: this.toEmailAddress,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        // 3)Send the email.
        await this.newTransport().sendMail(mailOptions);

    }
    
    async sendSignupVerificationMail() {
        await this.send('signupVerify', 'Email Confirmation');
    }

    async sendGreetingsEmail() {
        await this.send('signupGreet', 'Start your musical journey');
    }

    async sendResetTokenEmail() {
        await this.send('passReset', 'Reset Password');
    }
    
}