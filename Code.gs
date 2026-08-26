/**
 * SISTEMA MINISTÉRIO DE LOUVOR - IBPAZ
 * BACKEND GOOGLE APPS SCRIPT
 */

// ==========================================================
// CONTROLE DE VERSÃO DO APP
// Aumente este número toda vez que publicar uma atualização
// (Implantar > Gerenciar implantações > Editar > Nova versão).
// O front-end compara essa versão com a salva no celular do
// usuário e força um recarregamento sem cache quando mudar.
// ==========================================================
const APP_VERSION = "1.0.1";

function obterVersaoApp() {
  return APP_VERSION;
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Ministério de Louvor - IBPaz')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function configurarEstruturaInicial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = [
    { nome: 'DB_USUARIOS', cabecalho: ['ID', 'NOME', 'USUARIO', 'SENHA', 'NIVEL', 'FUNCAO_PRINCIPAL', 'TELEFONE'] },
    { nome: 'DB_GRUPOS', cabecalho: ['ID', 'NOME_GRUPO', 'MEMBROS', 'COR', 'CODIGO_LIDER', 'STATUS'] },
    { nome: 'DB_MUSICAS', cabecalho: ['ID', 'TITULO', 'ARTISTA', 'TOM', 'PALAVRA_CHAVE', 'SENTIMENTO', 'CIFRA', 'VIDEO'] },
    { nome: 'DB_ESCALAS', cabecalho: ['ID', 'DATA', 'HORA', 'TIPO_CULTO', 'GRUPO_ID', 'REPERTORIO_IDS'] },
    { nome: 'DB_ESTUDIO', cabecalho: ['ID', 'DATA', 'INICIO', 'FIM', 'RESPONSAVEL_ID'] },
    { nome: 'DB_INDISPONIVEIS', cabecalho: ['ID', 'USUARIO_ID', 'DATA', 'JUSTIFICATIVA'] },
    { nome: 'DB_CONFIG', cabecalho: ['CHAVE', 'VALOR'] }
  ];
  abas.forEach(function(abaInfo) {
    let aba = ss.getSheetByName(abaInfo.nome);
    if (!aba) {
      aba = ss.insertSheet(abaInfo.nome);
    }
    if (aba.getLastRow() === 0) {
      aba.getRange(1, 1, 1, abaInfo.cabecalho.length).setValues([abaInfo.cabecalho]);
      aba.getRange(1, 1, 1, abaInfo.cabecalho.length).setFontWeight("bold").setBackground("#f3f3f3");
    }
  });
  const abaUser = ss.getSheetByName('DB_USUARIOS');
  if (abaUser.getLastRow() === 1) {
    abaUser.appendRow(['USR1001', 'Administrador', 'admin', '123456', '1', 'Líder Geral', '5531999999999']);
  }
  const abaConfig = ss.getSheetByName('DB_CONFIG');
  if (abaConfig.getLastRow() === 1) {
    abaConfig.appendRow(['AVISO_1_TEXTO', 'Bem-vindo ao sistema de escalas do Ministério de Louvor!']);
    abaConfig.appendRow(['AVISO_1_MIDIA', '']);
    abaConfig.appendRow(['AVISO_1_TIPO', '']);
  }
  return "Estrutura do banco de dados configurada com sucesso!";
}

function autenticarUsuario(usuario, senha) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const aba = ss.getSheetByName('DB_USUARIOS');
    if (!aba) return { sucesso: false, mensagem: "Aba DB_USUARIOS não encontrada no banco." };
    
    const dados = aba.getDataRange().getDisplayValues();
    
    for (let i = 1; i < dados.length; i++) {
      const userLogin = dados[i][2] ? dados[i][2].toString().trim().toLowerCase() : "";
      const userSenha = dados[i][3] ? dados[i][3].toString().trim() : "";

      if (userLogin === usuario.toString().trim().toLowerCase() && userSenha === senha.toString().trim()) {
        
        const idUsuario = dados[i][0];
        let nomeGrupo = "Geral"; // Grupo padrão se não estiver em nenhum grupo

        // Busca qual é o Grupo do Usuário na aba DB_GRUPOS
        const abaGrupos = ss.getSheetByName('DB_GRUPOS');
        if (abaGrupos && abaGrupos.getLastRow() > 1) {
          const dadosG = abaGrupos.getDataRange().getDisplayValues();
          for (let g = 1; g < dadosG.length; g++) {
            // Coluna C (índice 2) é o ID do Membro
            if (dadosG[g][2] && dadosG[g][2].toString().trim() === idUsuario.toString().trim()) {
              nomeGrupo = dadosG[g][1] ? dadosG[g][1].toString().trim() : "Geral"; // Coluna B
              break;
            }
          }
        }

        return {
          sucesso: true,
          usuario: {
            id: idUsuario,
            nome: dados[i][1],
            login: dados[i][2],
            nivel: parseInt(dados[i][4]) || 3,
            funcao: dados[i][5] || "",
            telefone: dados[i][6] || "",
            grupo: nomeGrupo
          }
        };
      }
    }
    
    return { sucesso: false, mensagem: "Usuário ou senha incorretos." };

  } catch (erro) {
    return { sucesso: false, mensagem: "Erro no servidor: " + erro.toString() };
  }
}

function buscarConfigAviso() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_CONFIG');
  const avisos = [];
  if (aba && aba.getLastRow() > 1) {
    const dados = aba.getDataRange().getDisplayValues();
    [1, 2, 3].forEach(function(slot) {
      let texto = "";
      let midia = "";
      let tipoMidia = "";
      for (let i = 1; i < dados.length; i++) {
        if (dados[i][0] === 'AVISO_' + slot + '_TEXTO') texto = dados[i][1];
        if (dados[i][0] === 'AVISO_' + slot + '_MIDIA') midia = dados[i][1];
        if (dados[i][0] === 'AVISO_' + slot + '_TIPO') tipoMidia = dados[i][1];
      }
      if (texto !== "" || midia !== "") {
        avisos.push({ id: slot, texto: texto, midia: midia, tipoMidia: tipoMidia });
      }
    });
  }
  if (avisos.length === 0) {
    avisos.push({
      id: 1,
      texto: "Bem-vindo ao sistema de escalas do Ministério de Louvor!",
      midia: "",
      tipoMidia: ""
    });
  }
  return avisos;
}

function salvarConfigAviso(slotAviso, texto, arquivoBase64, nomeArquivo, tipoMime) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName('DB_CONFIG');
  if (!aba) {
    configurarEstruturaInicial();
    aba = ss.getSheetByName('DB_CONFIG');
  }
  let urlArquivo = "";
  let categoriaMidia = "";
  if (arquivoBase64 && nomeArquivo) {
    try {
      const bytes = Utilities.base64Decode(arquivoBase64.split(',')[1] || arquivoBase64);
      const blob = Utilities.newBlob(bytes, tipoMime, nomeArquivo);
     
      const pasta = DriveApp.getRootFolder();
      const arquivo = pasta.createFile(blob);
      arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
     
      const idArquivo = arquivo.getId();
      if (tipoMime.indexOf('image') !== -1) {
        urlArquivo = "https://lh3.googleusercontent.com/d/" + idArquivo;
        categoriaMidia = 'imagem';
      } else if (tipoMime.indexOf('audio') !== -1) {
        urlArquivo = "https://drive.google.com/uc?export=download&id=" + idArquivo;
        categoriaMidia = 'audio';
      } else if (tipoMime.indexOf('video') !== -1) {
        urlArquivo = "https://drive.google.com/file/d/" + idArquivo + "/preview";
        categoriaMidia = 'video';
      }
    } catch (e) {
      throw new Error("Erro ao salvar arquivo no Drive: " + e.toString());
    }
  }
  const dados = aba.getDataRange().getDisplayValues();
 
  function atualizarOuInserir(chave, valor) {
    let linha = -1;
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][0] === chave) {
        linha = i + 1;
        break;
      }
    }
    if (linha > -1) {
      aba.getRange(linha, 2).setValue(valor);
    } else {
      aba.appendRow([chave, valor]);
    }
  }
  atualizarOuInserir('AVISO_' + slotAviso + '_TEXTO', texto);
  if (urlArquivo !== "") {
    atualizarOuInserir('AVISO_' + slotAviso + '_MIDIA', urlArquivo);
    atualizarOuInserir('AVISO_' + slotAviso + '_TIPO', categoriaMidia);
  }
  return { sucesso: true, mensagem: "Aviso " + slotAviso + " atualizado com sucesso!" };
}

function buscarTodosUsuarios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_USUARIOS');
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getDisplayValues();
  const usuarios = [];
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    usuarios.push({
      id: dados[i][0],
      nome: dados[i][1],
      login: dados[i][2],
      nivel: dados[i][4],
      funcao: dados[i][5],
      telefone: dados[i][6]
    });
  }
  return usuarios;
}

function cadastrarNovoUsuario(dadosForm) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_USUARIOS');
  const id = 'USR' + Math.floor(1000 + Math.random() * 9000);
  aba.appendRow([
    id,
    dadosForm.nome,
    dadosForm.usuario,
    dadosForm.senha,
    dadosForm.nivel,
    dadosForm.funcao,
    dadosForm.telefone
  ]);
  return { sucesso: true, mensagem: "Integrante cadastrado com sucesso!" };
}

function buscarTodosGrupos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_GRUPOS');
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getDisplayValues();
  const gruposMap = {};
 
  for (let i = 1; i < dados.length; i++) {
    const idG     = String(dados[i][0]).trim();
    const nomeG   = dados[i][1];
    const idUsr   = String(dados[i][2]).trim();
    const corG    = dados[i][3] || '#0d6efd';
    const codG    = String(dados[i][4] || '3').trim();
    const statusG = dados[i][5] || 'Ativo';
    if (!idG) continue;
   
    if (!gruposMap[idG]) {
      gruposMap[idG] = {
        id: idG,
        nome: nomeG,
        cor: corG,
        status: statusG,
        membros: []
      };
    }
   
    if (idUsr) {
      gruposMap[idG].membros.push({
        idUser: idUsr,
        codigo: codG
      });
    }
  }
  return Object.values(gruposMap);
}

function obterGrupoParaEdicao(idGrupo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaGrupos = ss.getSheetByName("DB_GRUPOS");
  if (!abaGrupos) return null;
  var dados = abaGrupos.getDataRange().getValues();
  var grupoEncontrado = null;
  for (var i = 1; i < dados.length; i++) {
    var idG     = String(dados[i][0]).trim();
    var nomeG   = dados[i][1];
    var idUsr   = String(dados[i][2]).trim();
    var corG    = dados[i][3];
    var codG    = String(dados[i][4] || '3').trim();
    var statusG = dados[i][5] || 'Ativo';
    if (idG === String(idGrupo).trim()) {
      if (!grupoEncontrado) {
        grupoEncontrado = {
          id: idG,
          nome: nomeG,
          cor: corG,
          status: statusG,
          membros: []
        };
      }
     
      if (idUsr) {
        grupoEncontrado.membros.push({
          idUser: idUsr,
          codigo: codG
        });
      }
    }
  }
  return grupoEncontrado;
}

/**
 * Função de Salvamento do Grupo com suporte flexível aos formatos de dados do front-end
 */
function salvarEdicaoGrupo(dadosGrupo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaGrupos = ss.getSheetByName("DB_GRUPOS");
  if (!abaGrupos) return { sucesso: false, msg: "Aba DB_GRUPOS não encontrada." };
  var idGrupo = dadosGrupo.id || ("GRP_" + new Date().getTime());
 
  if (dadosGrupo.id) {
    var dados = abaGrupos.getDataRange().getValues();
    for (var i = dados.length - 1; i >= 1; i--) {
      if (String(dados[i][0]).trim() === String(dadosGrupo.id).trim()) {
        abaGrupos.deleteRow(i + 1);
      }
    }
  }
 
  if (dadosGrupo.membros && dadosGrupo.membros.length > 0) {
    dadosGrupo.membros.forEach(function(m) {
      var idUsuario = m.idUser || m.integrante || "";
      var codFuncao = m.codigo || m.funcao || "3";
      abaGrupos.appendRow([
        idGrupo,
        dadosGrupo.nome,
        idUsuario,
        dadosGrupo.cor || "#0d6efd",
        codFuncao,
        dadosGrupo.status || "Ativo"
      ]);
    });
  } else {
    abaGrupos.appendRow([
      idGrupo,
      dadosGrupo.nome,
      "",
      dadosGrupo.cor || "#0d6efd",
      "3",
      dadosGrupo.status || "Ativo"
    ]);
  }
  return { sucesso: true, idGrupo: idGrupo, mensagem: "Grupo salvo com sucesso!" };
}

// Alias para compatibilidade com a chamada salvarGrupoBackend() do front-end
function salvarGrupoBackend(dadosGrupo) {
  return salvarEdicaoGrupo(dadosGrupo);
}

function buscarTodasMusicas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_MUSICAS');
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getDisplayValues();
  const musicas = [];
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    musicas.push({
      id: dados[i][0],
      titulo: dados[i][1],
      artista: dados[i][2],
      tom: dados[i][3],
      palavraChave: dados[i][4],
      sentimento: dados[i][5],
      cifra: dados[i][6],
      video: dados[i][7]
    });
  }
  return musicas;
}

function cadastrarNovaMusica(dadosMusica) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_MUSICAS');
  const id = 'MUS' + Math.floor(1000 + Math.random() * 9000);
  aba.appendRow([
    id,
    dadosMusica.titulo,
    dadosMusica.artista,
    dadosMusica.tom,
    dadosMusica.palavraChave,
    dadosMusica.sentimento,
    dadosMusica.cifra,
    dadosMusica.video
  ]);
  return { sucesso: true, mensagem: "Música cadastrada no repertório!" };
}

function buscarEscalasDoMes() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
   
    // 1. Mapeia Usuários na DB_USUARIOS
    var abaUsuarios = ss.getSheetByName("DB_USUARIOS");
    var mapaUsuarios = {};
    if (abaUsuarios) {
      var dadosU = abaUsuarios.getDataRange().getValues();
      for (var u = 1; u < dadosU.length; u++) {
        if (!dadosU[u] || dadosU[u][0] === undefined || dadosU[u][0] === "") continue;
        
        var idUsuario = String(dadosU[u][0]).trim();
        if (idUsuario) {
          mapaUsuarios[idUsuario] = {
            nome: dadosU[u][1] ? String(dadosU[u][1]).trim() : 'Não informado',
            tel: dadosU[u][6] ? String(dadosU[u][6]).trim() : ''
          };
        }
      }
    }

    // 2. Mapeia Grupos na DB_GRUPOS
    var abaGrupos = ss.getSheetByName("DB_GRUPOS");
    var mapaGrupos = {};
    if (abaGrupos) {
      var dadosG = abaGrupos.getDataRange().getValues();
      for (var g = 1; g < dadosG.length; g++) {
        if (!dadosG[g] || dadosG[g][0] === undefined || dadosG[g][0] === "") continue;

        var idG      = String(dadosG[g][0]).trim();
        var nomeG    = dadosG[g][1] ? String(dadosG[g][1]).trim() : idG;
        var idMembro = dadosG[g][2] ? String(dadosG[g][2]).trim() : '';
        var corG     = dadosG[g][3] ? String(dadosG[g][3]).trim() : '#0d6efd';
        var funcao   = dadosG[g][4] ? String(dadosG[g][4]).trim().toLowerCase() : '';
        var statusG  = dadosG[g][5] ? String(dadosG[g][5]).trim() : 'Ativo';
       
        if (statusG.toLowerCase() === 'inativo') continue;
        if (corG && corG.indexOf('#') !== 0) corG = '#' + corG;

        if (!mapaGrupos[idG]) {
          mapaGrupos[idG] = {
            nome: nomeG,
            cor: corG,
            lider: 'Não informado',
            telefone: ''
          };
        }

        // Se for líder, atribui os dados se o ID do membro existir
        if ((funcao === 'lider' || funcao === 'líder') && idMembro) {
          if (mapaUsuarios[idMembro]) {
            mapaGrupos[idG].lider = mapaUsuarios[idMembro].nome;
            mapaGrupos[idG].telefone = mapaUsuarios[idMembro].tel;
          }
        }
      }
    }

    // 3. Mapeia Músicas
    var abaMusicas = ss.getSheetByName("DB_MUSICAS");
    var mapaMusicas = {};
    if (abaMusicas) {
      var dadosM = abaMusicas.getDataRange().getValues();
      for (var m = 1; m < dadosM.length; m++) {
        if (!dadosM[m] || dadosM[m][0] === undefined || dadosM[m][0] === "") continue;
        var idMus = String(dadosM[m][0]).trim();
        if (idMus) mapaMusicas[idMus] = dadosM[m][1] ? String(dadosM[m][1]).trim() : idMus;
      }
    }

    // 4. Monta Escalas
    var abaEscalas = ss.getSheetByName("DB_ESCALAS");
    if (!abaEscalas) return [];
    
    var dadosE = abaEscalas.getDataRange().getValues();
    var listaEscalas = [];

    for (var k = 1; k < dadosE.length; k++) {
      if (!dadosE[k] || dadosE[k][4] === undefined) continue;

      var linha = dadosE[k];
      var rawData = linha[1];
      var rawHora = linha[2];
      var tipoCulto = linha[3] ? String(linha[3]) : '';
      var grupoId = String(linha[4]).trim();
      var repertorioRaw = linha[5] ? String(linha[5]) : '';

      if (!grupoId || !mapaGrupos[grupoId]) continue;
      var infoGrupo = mapaGrupos[grupoId];
     
      // Data
      var dataFmt = '';
      if (rawData instanceof Date) {
        dataFmt = Utilities.formatDate(rawData, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
      } else if (rawData) {
        dataFmt = String(rawData);
        if (dataFmt.includes('T')) {
          var partes = dataFmt.split('T')[0].split('-');
          if (partes.length === 3) dataFmt = partes[2] + '/' + partes[1] + '/' + partes[0];
        }
      }
     
      // Hora
      var horaFmt = '';
      if (rawHora instanceof Date) {
        horaFmt = Utilities.formatDate(rawHora, ss.getSpreadsheetTimeZone(), "HH:mm");
      } else if (rawHora) {
        horaFmt = String(rawHora);
      }
     
      // Músicas
      var listaMusicas = [];
      if (repertorioRaw) {
        var repertorioIds = repertorioRaw.split(',');
        repertorioIds.forEach(function(idM) {
          var idLimpo = idM.trim();
          if (idLimpo) {
            if (mapaMusicas[idLimpo]) listaMusicas.push(mapaMusicas[idLimpo]);
            else listaMusicas.push(idLimpo);
          }
        });
      }

      listaEscalas.push({
        grupoNome: infoGrupo.nome,
        cor: infoGrupo.cor,
        lider: infoGrupo.lider,
        telefone: infoGrupo.telefone,
        data: dataFmt,
        hora: horaFmt,
        tipoCulto: tipoCulto,
        repertorio: listaMusicas
      });
    }

    return listaEscalas;

  } catch (erro) {
    Logger.log("Erro no buscarEscalasDoMes: " + erro.toString());
    return []; // Retorna lista vazia em vez de estourar erro no JS frontend
  }
}

function criarNovaEscala(dadosEscala) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_ESCALAS');
  const id = 'ESC' + Math.floor(1000 + Math.random() * 9000);
  const reperStr = Array.isArray(dadosEscala.repertorio) ? dadosEscala.repertorio.join(',') : dadosEscala.repertorio;
  aba.appendRow([
    id,
    dadosEscala.data,
    dadosEscala.hora,
    dadosEscala.tipoCulto,
    dadosEscala.grupoId,
    reperStr
  ]);
  return { sucesso: true, mensagem: "Escala salva com sucesso!" };
}

function buscarAgendaEstudio() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_ESTUDIO');
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getDisplayValues();
  const usuarios = buscarTodosUsuarios();
  const agenda = [];
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    const userObj = usuarios.find(function(u) { return u.id === dados[i][4]; });
    agenda.push({
      id: dados[i][0],
      data: dados[i][1],
      inicio: dados[i][2],
      fim: dados[i][3],
      responsavelNome: userObj ? userObj.nome : dados[i][4],
      responsavelTelefone: userObj ? userObj.telefone : ''
    });
  }
  return agenda;
}

function agendarHorarioEstudio(dadosAgendamento) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_ESTUDIO');
  const id = 'EST' + Math.floor(1000 + Math.random() * 9000);
  aba.appendRow([
    id,
    dadosAgendamento.data,
    dadosAgendamento.inicio,
    dadosAgendamento.fim,
    dadosAgendamento.responsavelId
  ]);
  return { sucesso: true, mensagem: "Ensaio reservado no estúdio!" };
}

function registrarIndisponibilidade(usuarioId, data, justificativa) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_INDISPONIVEIS');
  const id = 'IND' + Math.floor(1000 + Math.random() * 9000);
  aba.appendRow([id, usuarioId, data, justificativa]);
  return { sucesso: true, mensagem: "Ausência bloqueada no calendário!" };
}

function buscarIndisponiveisPorMes(mes, ano) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_INDISPONIVEIS');
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getDisplayValues();
  const usuarios = buscarTodosUsuarios();
  const resultado = [];
  for (let i = 1; i < dados.length; i++) {
    const dataStr = dados[i][2];
    if (dataStr) {
      const partes = dataStr.split('-');
      if (partes.length === 3) {
        if (partes[1] === mes && partes[0] === ano) {
          const userObj = usuarios.find(function(u) { return u.id === dados[i][1]; });
          resultado.push({
            id: dados[i][0],
            usuarioNome: userObj ? userObj.nome : "Integrante",
            usuarioTelefone: userObj ? userObj.telefone : "",
            data: dataStr,
            justificativa: dados[i][3]
          });
        }
      }
    }
  }
  return resultado;
}

function buscarTodosIntegrantes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName('DB_USUARIOS');
 
  if (!aba || aba.getLastRow() <= 1) return [];
  const dados = aba.getDataRange().getValues();
  const integrantes = [];
  for (let i = 1; i < dados.length; i++) {
    const row = dados[i];
   
    if (!row[0] && !row[1]) continue;
    integrantes.push({
      id: String(row[0]).trim(),
      nome: String(row[1]).trim(),
      usuario: String(row[2]).trim(),
      nivel: String(row[4] || '3'),
      funcao: String(row[5] || ''),
      telefone: String(row[6] || '')
    });
  }
  return integrantes;
}
