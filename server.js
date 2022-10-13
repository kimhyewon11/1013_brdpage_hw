const express = require("express");

//데이터베이스의 데이터 입력, 출력을 위한 함수 명령어 불러들이는 작업
const MongoClient = require("mongodb").MongoClient;

//시간 관련 데이터 받아오기 위한 라이브러리 함수 사용
const moment = require("moment");


const app = express();

const port = 8080;


//css/img/js (정적인 파일)사용하려면 이코드를 작성
app.use(express.static('public'));


//ejs 태그를 사용하기 위한 세팅 
app.set("view engine","ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({extended: true}));

//데이터 베이스 연결 작업
let db; //데이터 베이스 연결을 위한 변수 세팅(변수의 이름 자유롭게 가능)
MongoClient.connect("mongodb+srv://admin:qwer1234@testdb.mopkvcj.mongodb.net/?retryWrites=true&w=majority",function(err,result){

    //에러가 발생했을 경우 메세지 출력 (선택사항)
    if(err){ return console.log(err);}
    //위에서 만든 db 변수에 최종연결 
    db = result.db("testdb");//괄호 안에 mongodb atlas 사이트에서 생성한 데이터베이스 이름 

    //db 연결이 제대로 됐으면 서버실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });
});

//게시글 작성 페이지 경로 요청 
app.get("/insert",function(req,res){
    res.render("brd_insert");
});

app.post("/add",function(req,res){

    let times = moment().format("YY-MM-DD HH:mm:ss")

    db.collection("ex6.1_count").findOne({name:"게시판"},function(err,result){
        db.collection("ex6.1_board").insertOne({
            brdid:result.totalcount+1,
            brdauther:req.body.auther,
            brdtitle:req.body.title,
            brdcontext:req.body.context,
            brdtime : times,
            brdviews : 0
        },function(err,result){
            db.collection("ex6.1_count").updateOne({name:"게시판"},{$inc:{totalcount:1}},function(err,result){
                res.redirect("/list");
            });
        });
    });
});

//상세페이지 
app.get("/list",function(req,res){
    //db에서 게시글 관련 데이터 꺼내서 갖고온 후 brd_list.ejs 전달
    db.collection("ex6.1_board").find().toArray(function(err,result){
        res.render("brd_list.ejs",{data:result});
    });
});


// 리스트 순번 제목 클릭했을 때 상세페이지 숫자 연동
app.get("/detail/:no",function(req,res){
    db.collection("ex6.1_board").updateOne({brdid:Number(req.params.no)},{$inc:{brdviews:1}},function(err,result){
        db.collection("ex6.1_board").findOne({brdid:Number(req.params.no)},function(err,result){
            res.render("brd_detail",{data:result});
        });
    });
});

//수정 페이지
app.get("/uptview/:no",function(req,res){
    db.collection("ex6.1_board").findOne({brdid:Number(req.params.no)},function(err,result){
        res.render("brd_uptview",{data:result});
    });
});

//수정 끝내고 /update 경로로 요청하면 내가 수정한 데이터들로 변경 
app.post("/update",function(req,res){
    db.collection("ex6.1_board").updateOne({brdid:Number(req.body.id)},{$set:{
        brdtitle:req.body.title,
        brdcontext:req.body.context,
        brdauther:req.body.auther
    }},function(err,result){
        res.redirect("/detail/" + req.body.id);
    });
});

//삭제요청
app.get("/delete/:no",function(req,res){    
    //데이터베이스에 접근해서 ex6_board에 해당 게시글 번호에 객체만 지움. 
    db.collection("ex6.1_board").deleteOne({brdid:Number(req.params.no)},function(err,result){
        res.redirect("/list");//데이터 삭제후 게시글 목록페이지로 이동
    });
});