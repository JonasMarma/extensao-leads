const version = "1.0";

const jsonVersao = "https://raw.githubusercontent.com/JonasMarma/extensao-leads/main/manifest.json";

// Método para puxar dados json
const getJSON = async url => {
    const response = await fetch(url);
    if (!response.ok) // check if response worked (no 404 errors etc...)
        throw new Error(response.statusText);

    const data = response.json(); // get JSON from the response
    return data; // returns a promise, which resolves to this data value
}

let element = document.getElementById("content");

const htmlPadrao = `
<h2>Semetron</h2>
<p>v1.0</p>
<p>Feito com <3 por: <a href='https://github.com/JonasMarma' target='blank'>Jonas Marma</a>  :)</p>`;

// Obter na internet a versão mais recente da extensão para comparar com a versão atual
getJSON(jsonVersao).then(data => {
    console.log("Versão mais recente:");
    console.log(data.version);
    console.log("Versão instalada");
    console.log(version);

    if(version == data.version) {
        element.innerHTML = htmlPadrao;
    } else {
        element.innerHTML = "VERSÃO ANTIGA DA EXTENSÃO DETECTADA! ENTRE EM CONTATO COM SEU LÍDER!";
    }

}).catch(error => {
    console.error(error);
    element.innerHTML = `
    <h3>Erro ao obter a versão da extensão!</h3>
    <p>referência visitada: ` + jsonVersao  + `</p>
    <p>Erro:</p>` + error;
});
