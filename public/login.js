
async function showNotice(text,time, type = "success") {
  const notice = document.createElement("div");
  notice.textContent = text;
  notice.style.position = "fixed";
  notice.style.top = "20px";
  notice.style.left = "50%";
  notice.style.transform = "translateX(-50%)";
  notice.style.padding = "12px 20px";
  notice.style.borderRadius = "8px";
  notice.style.color = "#fff";
  notice.style.fontSize = "16px";
  notice.style.zIndex = "9999";
  notice.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  notice.style.transition = "opacity 0.5s";

  if (type === "success") {
    notice.style.backgroundColor = "#4CAF50"; // 緑
  } else if (type === "error") {
    notice.style.backgroundColor = "#f44336"; // 赤
  }

  document.body.appendChild(notice);

  // time/1000秒後にフェードアウトして削除
  setTimeout(() => {
    notice.style.opacity = "0";
    setTimeout(() => notice.remove(), 500);
  }, time);
}

function generateNumberString(length) {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

alert("チャットの蹴り権限、URLのスパフィルを確認してから使用してください")

const pincode = generateNumberString(6);

document.getElementById("loginBottan").addEventListener("click", async () => {
  
  const email=document.getElementById("email").value;
  const password = document.getElementById("password").value
 

 try{ 
   
  await showNotice(`LINEでPINコード\n${pincode}\nを入力してください`,50000);
const res=await fetch("/api/app/login",{
    method: "POST",
      headers: { "Content-Type": "application/json" }, 
   body: JSON.stringify({ "email":email,"password":password,"pincode":pincode }),
  })
   .then(response => {
     // レスポンスが成功したか確認 (ステータスコード200-299)
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

      return response.json();
     })
   .then(responseData => {
     
     const token=responseData.token;
      window.location.href =`/home?token=${token}`
     
   })
   .catch(error => {
     // リクエストや処理中にエラーが発生
     console.error('Error:', error);
   });

  
   const token =res.token;
   window.location.href =`/home?token=${token}`;
   
 }catch(e){
   await showNotice("何らかのエラーが発生しました。", 5000,"error");
  console.log(e);
   
 };
    
});
