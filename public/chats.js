
function showNotice(text, type = "success"){
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

  
  setTimeout(() => {
    notice.style.opacity = "0";
    setTimeout(() => notice.remove(), 500);
  }, 3000);
}

const urlParams = new URLSearchParams(window.location.search);
const UserToken = urlParams.get('token');

const loadingElement = document.getElementById('loading');
loadingElement.style.display = 'block';


// fetchを用いてサーバーからチャットデータを取得
fetch(`/api/app/squares`, {
    method: 'POST', 
    headers: {
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ token: UserToken }) 
})
.then(response => {
   
    if (!response.ok) {
        throw new Error('ネットワークエラー');
    }
    return response.json();
})
.then(chatData => {
    const chatContainer = document.getElementById('chat');

    chatData.forEach(chat => {
        chatContainer.innerHTML += `
            <div class="chat-container">
                <div class="chat-header">${chat.chatName}</div>
                <div class="chat-body">Name: ${chat.Name}</div>
                <button class="chat-button" onclick="sendRequest('${chat.chatMid}', '${UserToken}')">note全消しリクエスト送信</button> 
            </div>
        `;
    });
})
.finally(() => {
        // ローディングメッセージを非表示
        loadingElement.style.display = 'none';
    })
.catch(error => {
    console.error('エラー:', error);
});




function sendRequest(chatId, userToken) {
    console.log('リクエストを送信:', chatId);
    //showNotice(data.message);
    // リクエストを送信
    fetch('/api/alldelete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId: chatId, token: userToken })
    })
    .then(response => response.json())
    .then(data => {
        console.log('レスポンス:', data);
        // 必要に応じて追加の処理を行う
        showNotice(data.message);
    })
    .catch(error => {
        console.error('リクエストエラー:', error);
  })

}
