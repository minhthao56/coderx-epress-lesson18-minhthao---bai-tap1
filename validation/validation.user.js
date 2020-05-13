var db = require('../db');
var bcrypt = require('bcrypt');
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);




module.exports.postAdd = function(req, res, next){
   var user = db.get("users").find({email: req.body.email}).value();
    if (req.body.name.length>30){
        var err = "Không được nhập quá 30 ký tự"
        res.render('users/add',{
            err: err
        })
    }
    else if (user){
        var err = "Email đã tồn tại"
        res.render('users/add',{
            err: err
        })
    }
    else if (req.body.pass.length<8){
        var err = "Mật khấu phải trên 8 kí tự"
        res.render('users/add',{
            err: err
        })
    }
    else{next()}
};



module.exports.checkWrongpass = function(req, res, next){
    var email = req.body.email;
    console.log(email)
    var msg = {
        to: email,
        from: "minhthao1111@outlook.com",
        subject: 'Your account login in YOUR BOOK over 3 times',
        text: 'You should check your accout and change your password right now.',
        html: '<strong>Very Important</strong> You should check your accout and change your password right now. I think someone is trying to login your account illegaly. If you have any trouble, please contact to our!',
      };
    var user = db.get("users").find({email: email}).value();
    if (user.wrongLoginCount > 3){
        sgMail
            .send(msg)
            .then(() => {}, error => {
                console.error(error);
            if (error.res) {
            console.error(error.res.body)
    }
  });
    }
    else if (user.wrongLoginCount > 4){
        res.render("auth/login-many-times",{
            err: "You wrong password many times. Login again after 30 min",
         });
    }
    else if (!bcrypt.compareSync(req.body.pass, user.pass)){
        db.get('users')
            .find({email: email})
            .assign({wrongLoginCount: parseInt(user.wrongLoginCount+1)})
            .write()
            res.render("auth/login",{
                err: "Wrong pass",
                values: req.body
             });
    }
    
    else{
        next()
    }
}