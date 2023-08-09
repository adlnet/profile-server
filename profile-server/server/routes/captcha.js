const RecaptchaV2 = require("express-recaptcha").RecaptchaV2;

const recaptcha = new RecaptchaV2(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);
const SKIP_RECAPTCHA = (process.env.SKIP_RECAPTCHA || false);

module.exports = {
    
    checkCaptcha: () => (req, res, next) => {

        if (SKIP_RECAPTCHA) {
            return next();
        }

        req.body["g-recaptcha-response"] = req.body["recaptcha"];

        recaptcha.verify(req, (err, _) => {
            if (err) {
                res.status(400).send({
                    success: true,
                    err: "Captcha was either bad or it expired."
                });
            }
            else {
                delete req.body["recaptcha"];
                delete req.body["g-recaptcha-response"];
                next();
            }
        });
    }
}
