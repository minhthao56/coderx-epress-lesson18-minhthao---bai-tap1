var db = require('../db');
module.exports.mustlogin = function(req, res, next){
    var user = db.get("users").find({id: req.signedCookies.userId}).value();
    if (!req.signedCookies.userId){
        res.redirect('/auth/login');
    }
    else if (!user){
        
        res.redirect('/auth/login');
    }else {
        res.locals.user = user;
        next()
    }
}
module.exports.notIntoTrans = function(req, res, next){
    var user = db.get("users").find({id: req.signedCookies.userId}).value();
    var dbtransOfuser = db.get("trans").filter({userId: user.id}).value();
    var bookOfuser=[];
    for ( tran of dbtransOfuser){
        var Objbook=db.get("titles").find({id: tran.bookId}).value();
        bookOfuser.push(Objbook)
    }
    if (user.isAdmin==="false"){
        res.render("transactions/transOfuser", {
            dbtransOfuser: dbtransOfuser,
            name: user.name,
            bookOfuser: bookOfuser
        });
    }else {next()}
}