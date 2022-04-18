console.log("HELLO WORLD");

// Enviar dados para sheets
const request = new XMLHttpRequest();

request.addEventListener('readystatechange', () => {
    if(request.readyState === 4 && request.status === 200) {
        console.log(request, request.responseText);
    } else if(request.readyState === 4) {
        //console.error("ERRO AO ACESSAR API" + request.response);
        console.log("Não recebeu 200");
    }
});

url = 'https://script.google.com/macros/s/AKfycbw4wcMDi72KK5MP7JuZp3YuVvE7jhgKprsHfE23-QEgRBuBO_fiLG55MGqvUhYogn0qTg/exec?'

url += 'name=' + window.location.href;

request.open('GET', url);
request.send();