var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://Xaopaibun:vanquy@cluster0.bxvyn.mongodb.net/test";
var md5 = require('md5');
var jwt = require('jsonwebtoken');

const getuser = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        var dbo = db.db("DbCoffeeHouse");
        dbo.collection("User").find().toArray(function (err, result) {
            if (err) res.sendStatus(405);
            res.send(result);
            db.close();
        });
    });
}

const refreshToken =(req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        console.log(err, data);
        if (err) res.sendStatus(403);
        const accessToken = jwt.sign(
            { username: data.username },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '30s',
            }
        );
        res.json({ accessToken });
    });
};

const GenerateToken = (data) =>{
    let token = jwt.sign({data},process.env.ACCESS_TOKEN_SECRET, {  expiresIn: '2h'} );
    return token;
}


const DecodeToken = (token) =>{
    try {
        let data = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        return data;
    } catch (error) {
        return false;
    }
}

const getProfile = (req, res, next) =>{
    let token = req.headers.token;
  
    let profile = DecodeToken(token);
    if(profile){
        res.send({profile : profile})
    }
    else{
        res.status(401).send({message : "Invalid Token"});
    }
}

const login = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        var dbo = db.db("DbCoffeeHouse");
        dbo.collection("User").findOne({ gmail: req.body.gmail, password:  md5(req.body.password), type : false }, function (err, result) {
            if (err) {
                res.sendStatus(405);
            }
            else {
                if (result != null) {
                    // let data = DecodeToken(accessToken)
                    let data = {name : result.name, phone :  result.phone, gmail :  result.gmail}
                    let accessToken = GenerateToken(data);
                    res.json({ accessToken});
                }
                else {
                    res.status(404).send({ ThongBao: "B???n nh???p sai t??i kho???n ho???c m???t kh???u r???i" });
                }
            }
            db.close();
        });
    });
}

const logout = (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((refToken) => refToken !== refreshToken);
    res.sendStatus(200);
};

const dangky = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        var dbo = db.db("DbCoffeeHouse");
        let dulieu = { gmail: req.body.gmail, password: md5(req.body.password), name: req.body.name, phone: req.body.phone, status: true, type: false };
        dbo.collection("User").findOne({ gmail: req.body.gmail },  (err, result) =>{
            if (err) res.status(405).send(err);
            if (result == null) {
                dbo.collection("User").insertOne(dulieu, (err, result) => {
                    if (err) res.status(405).send({ error: "abc" });
                    // mailer.sendMail(req.body.gmail, '????ng k?? t??i kho???n Coffee House', 'Ch??c m???ng b???n ???? ????ng k?? t??i kho???n th??nh c??ng! T??i kho???n truy c???p c???a b???n : '+ req.body.gmail);
                    res.send('????ng k?? t??i kho???n th??nh c??ng');
                });
            }
            else res.send('T??i Kho???n ???? t???n t???i ');
            db.close();
        });
    });
}


const loginAdmin = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        var dbo = db.db("DbCoffeeHouse");
        dbo.collection("User").findOne({ gmail: req.body.gmail, password:  md5(req.body.password), type : true }, function (err, result) {
            if (err) {
                res.sendStatus(405);
            }
            else {
                if (result != null) {
                    let data = {gmail: req.body.gmail, name :result.name }
                    let accessToken =  GenerateToken(data);
                    res.json({ accessToken  });
                }
                else {
                    res.status(404).send({ ThongBao: "B???n nh???p sai t??i kho???n ho???c m???t kh???u r???i" });
                }
            }
            db.close();
        });
    });
}


module.exports = {
    loginAdmin:loginAdmin,
    dangky : dangky,
    logout :  logout,
    refreshToken : refreshToken,
     getuser : getuser,
     login: login,
     getProfile : getProfile
}