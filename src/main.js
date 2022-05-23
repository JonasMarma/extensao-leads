'use strict';

import * as scrap from "./scrap.js";


const periodo = 5000;

// Variável onde é armazenado o link que está sendo visitado no tick atual
let linkAtual = "";

// Variável onde é armazenado o link visitado no último tick
let linkAntigo = "";

let pagPerfil = false;

function enviarRequest(dados) {
    // Enviar dados para sheets
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4 && request.status === 200) {
            console.log(request, request.responseText);
        } else if (request.readyState === 4) {
            //console.error("ERRO AO ACESSAR API" + request.response);
            console.log("Não recebeu 200");
        }
    });

    let url = 'https://script.google.com/macros/s/AKfycbw4wcMDi72KK5MP7JuZp3YuVvE7jhgKprsHfE23-QEgRBuBO_fiLG55MGqvUhYogn0qTg/exec?'

    url += 'data=' + "teste";//btoa(dados);

    request.open('GET', url);
    request.send();

    console.log("PRONTO!");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("CONTENT JS RUNNING IN MAIN!");

    let dadosPerfil = "";

    while (true) {
        await sleep(periodo);

        console.log("TICK!");

        try {


            // LINK //////////////////////////////////////////////////////////////////////////////////
            console.log("Extraindo link:");
            linkAtual = window.location.toString();
            console.log(linkAtual);

            // Se acabou de sair de uma página de perfil, enviar os dados para o sheets
            if (linkAtual != linkAntigo) {
                if (pagPerfil) {
                    console.log("ENVIANDO DADOS PARA O SHEETS");
                    let dados = Date.now().toString() + ";;" + dadosPerfil;
                    enviarRequest(dados);

                    return; // APAGAR!
                }
            }

            if (!(linkAtual.includes("linkedin.com/in/"))) {
                console.log("Não é página de perfil!");

                pagPerfil = false;

                // NÃO É PÁGINA DE PERFIL, MAS TENTAR FAZER SCRAPPING DE LINKS DE PERFIS!!
            }
            // Se é uma página de perfil, obter os dados do perfil
            else {
                console.log("É página de perfil!");

                pagPerfil = true;

                dadosPerfil = linkAtual + ";;"

                // OBTER O HTML DA PÁGINA
                let source = document.body.innerHTML;
                //console.log(source);

                // Remover quebras de linha antes de processar
                source = source.replace(/(\r\n|\n|\r)/gm, "");

                // Fazer o scrapping
                dadosPerfil = dadosPerfil + scrap.getNome(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getCargo(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getEmpresa(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getFormacao(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getAtividade(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getSobre(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getExp(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getEdu(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getCertificados(source) + ";;";

                dadosPerfil = dadosPerfil + scrap.getCompetencias(source) + ";;";

                console.log(dadosPerfil);

                // Os dados do perfil serão enviados quando o usuário mudar de página

            }

        } catch (error) {
            console.error(error);
        }

        // A cada tick atualizar o link antigo
        linkAntigo = linkAtual;

    }
}

run();