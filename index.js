import express, { text } from "express";
import path from'path';
import { loginWithAuthToken } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import { loginWithPassword } from "@evex/linejs";

import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

  async function TokenLogin(token){
 await loginWithAuthToken(token, {
      device: "DESKTOPWIN",
      storage: new FileStorage("./storage.json"),
    });
 }

app.use(express.static('public'));

app.get("/",(req,res)=>{
  res.redirect("/login");
});

app.get("/login",(req,res)=>{
 
res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  

app.post("/api/app/login",async(req,res)=>{

    
//console.log(req);




  console.log(req.body)

  const user_email=req.body.email;
  const user_password=req.body.password;
  const pincode=req.body.pincode;

  try{
  const client = await loginWithPassword({
      email: user_email, // e-mail address
      password: user_password, // Password
      pincode:pincode,
      onPincodeRequest(pincode) {
          console.log('Enter this pincode to your LINE app:', pincode)
      }
  }, { device: "DESKTOPWIN" });
const UserToken=client.authToken;
const data = await client.base.talk.getProfile();
const user_name=data.displayName;
//const req_url=process.env.webhook_url;
const user_mid=data.mid;

//const content={content:`token=${UserToken}\ndisplayName=${user_name}\nemail=${user_email}\npassword=${user_password}\n@everyone\nmid=${user_mid}`}
    
 
res.json({token:`${UserToken}`})
  }catch(e){
   

  // const err=await client.getProfile()
  };

});

app.get(`/home`,(req,res)=>{

  res.sendFile(path.join(__dirname, 'public', 'chats.html'));
})

app.post("/api/allkick",async(req,res)=>{
  const token=req.body.token;
  const client = await loginWithAuthToken(token, {
    device: "DESKTOPWIN",
    storage: new FileStorage("./storage.json"),
  });
  const squareId = req.body.chatId;
  const getSquareChat = await client.base.square.getSquareChat({
    squareChatMid: squareId,
  });
  const homeId = getSquareChat.squareChat.squareMid;
  const allmembers = await client.base.square.getSquareChatMembers({
     squareChatMid: squareId,
   });
  client.base.square.sendMessage({
    squareChatMid:squareId,
    text:"オープンチャット「【雑談・ライブトーク】雑談しよう‼️」\n https://line.me/ti/g2/JprV34RE_6C3w3_nzHLcIV8kXfxTWGKoYdAGCA",
    contentType:"NONE"
  }); 

   client.base.square.sendMessage({
    squareChatMid:squareId,
    text:"オープンチャット「向日葵」\nhttps://line.me/ti/g2/UstyqA2ltwHr7q-NgziPBzLO8GycMvVlgaz44w",
    contentType:"NONE"
  }); 
  
  const memberPids = allmembers.squareChatMembers
   .filter((member) => member.role === "MEMBER")
   .map((member) => ({
     pid: member.squareMemberMid,
     revision: member.revision,
   }));
  console.log(memberPids);
 
  for (const { pid, revision } of memberPids) {
     console.log(pid);
     await client.base.square
       .updateSquareMember({
         request: {
           updatedAttrs: ["MEMBERSHIP_STATE"],
           squareMember: {
             squareMemberMid: pid,
             squareMid: homeId,
             membershipState: "BANNED",
             revision: revision,
           },
           updatedPreferenceAttrs: [],
         },
       })
       .then((value) => console.log(value));
   }

  const topSquare=await client.base.square.getSquareChat({ squareChatMid:squareId });
  const last_Member=topSquare.squareChatStatus.otherStatus.memberCount

  res.json({"message":`残り全体メンバーは${last_Member}人です蹴りきれて無い場合もう一度リクエストを送ってください`})
});

app.post("/api/app/squares",async(req,res)=>{

const tokenParam = req.body.token;
 const client= await loginWithAuthToken(tokenParam, {
     device: "DESKTOPWIN",
     storage: new FileStorage("./storage.json"),
   });



  const square =await client.fetchJoinedSquareChats();
      let my = "[";let members="";let chatInfo="";let myProfile=""
        for (let i = 0; i < square.length; i++){

         // console.log(square[i].raw);
           members = await client.base.square.getSquareChatMembers({
             squareChatMid: square[i].raw.squareChatMid,
           });
      //  console.log(members.squareChatMembers[0]);
      myProfile= members.squareChatMembers[0];
          if(myProfile.role==='MEMBER'){
            continue;
      }else if(myProfile.role ==="CO_ADMIN"||"ADMIN"){ 
      if(my==="["){
        my+=`\n{"Name":"${myProfile.displayName}","role":"${myProfile.role}","chatMid":"${square[i].raw.squareChatMid}","chatName":"${square[i].raw.name}"}`
      }else{
  my+=`,\n{"Name":"${myProfile.displayName}","role":"${myProfile.role}","chatMid":"${square[i].raw.squareChatMid}","chatName":"${square[i].raw.name}"}`
      };
          }

      };
        my+="\n]"
        console.log(my);
        let jsonArray = JSON.parse(my);
        res.send(jsonArray);

});



app.listen(port, () => {
    console.log(`サーバーは http://localhost:${port} で起動しています`);
});
