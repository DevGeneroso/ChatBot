import { VenomBot } from "./venom.js";
import { stages, getStage } from "./stages.js";
import { storage } from "./storage.js";
import { findValidNumsCel, findValidToken, updateNumber, findValidDescription, findValidLogin } from "./db/db_local_config_bd.js";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const __dirname = path.resolve();
let _celNum = '';
let codigoTJ = '';

app.set("view engine", "ejs");

app.get("/index", (req, res) => {
  res.render("index.ejs");
})

app.get("/adm-login", (req, res) => {
  res.render("adm_login.ejs");
})

app.use(express.static(path.join(__dirname, "images")));

app.use(express.static(path.join(__dirname, "views"), { 
  setHeaders: (res, path) => {
    if (path.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css");
    }
  }
}));

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

io.on("connection", async (socket) => {
  const onMessage = async (message) => {
    if (message.isGroupMsg) return;

    let { from, body, to } = message;

    let session = to.replace(/\D/g, "");
    const numberDDI = session.substr(0, 2);
    const numberDDD = session.substr(2, 2);
    const numberUser = session.substr(-8, 8);

    if (numberDDD >= 30) {
      session = numberDDI + numberDDD + "9" + numberUser;
    }

    console.log(session);
    if (body?.toUpperCase() === "SAIR") {
      console.log(storage[from]);
      delete storage[from];
      await VenomBot.getInstance().sendText({
        session,
        to: from,
        message: "Obrigado pelo contato.\nAtendimento encerrado.",
      });
    } else {
      const currentStage = getStage({ from });
      await stages[currentStage].stage.exec({
        from,
        message: body,
        sender: message.sender,
        to: session,
      });
    }
  };

  const initBot = async (numCel) => {
    VenomBot.getInstance()
      .init({
        session: numCel,
        headless: true,
        useChrome: false,
        onMessage,
      })
      .then((client) => {
        client.onMessage(onMessage);
        socket.emit("logado");
      })
      .catch((error) => {
        console.error(`Erro ao iniciar client para o número ${numCel}.`, error);
      });
  };

  socket.on("create-session", async function (data) {
    console.log("Create session: " + data.id + "\nMD: " + data.md);
    const [rows, fields] = await findValidNumsCel();
    let numberExists = false;

    const directory = "./images/";
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }
      if (files.length === 0) {
        console.log("No files to delete.");
        return;
      }
      files.forEach((file) => {
        if (file == data.id + '.png') {
          fs.unlinkSync('./images/' + data.id + '.png');
        }
      });
    });

    rows.forEach((row) => {
      if (data.id == row.NUM_CEL) {
        initBot(row.NUM_CEL);
        numberExists = true;
        _celNum = row.NUM_CEL;
      } else {
        updateNumber(codigoTJ, data.id);
      }
    });
    socket.emit("number-exists", numberExists);

    if (numberExists) {
      socket.emit("session", data.id + ".png");
    }
  });

  const imagesDirectory = path.join(__dirname, "images");
  function checkAndEmitQrcode(num, data) {
    fs.readdir(imagesDirectory, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }    
      const imageFiles = files.filter(file => file.endsWith(".png"));
      const imagemAlvo = num + ".png";

      if(imageFiles.includes(imagemAlvo)) {
        socket.emit("qrcode", data + ".png");
      } else {
        setTimeout(() => {
          checkAndEmitQrcode(num, data);
        }, 1000);
      }
    });
  }
  socket.on("qrcode", function (data) {
    checkAndEmitQrcode(_celNum, data);
  });

  socket.on("qrcodeLoad", function (data) {
    setTimeout(function () {
      socket.emit("qrcodeLoad", data + ".png");
    }, 1000);
  });

  socket.on("login", async (token) => {
    const [token_bd] = await findValidToken();

    let isValid = false;
    token_bd.forEach((tokens) => {
      if (token === tokens.TOKEN) {
        isValid = true;
        codigoTJ = tokens.CODIGO_TJ;
        app.get('/home', (req, res) =>{
          res.render('home_multi.ejs')
        })
      }
    });
    socket.emit('loginResponse', isValid);
  });

  socket.on("login-adm", async (login, senha) => {
    const [loginTotal] = await findValidLogin(login, senha);
    let valido = false;
    if (loginTotal) {
      valido = true;
      app.get('/adm', (req, res) =>{
        res.render('home_total.ejs')
      })
    }
    socket.emit('loginAdmResponse', valido);
  });

  const tokensFolder = "./tokens/";
  let sessoesAtivas = [];
  fs.readdir(tokensFolder, async (err, tokens) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    sessoesAtivas = tokens;
    const descricaoNumeroPairs = [];

    for (const sessao of sessoesAtivas) {
      const descricao = await findValidDescription(sessao);
      const numero = sessao;

      descricaoNumeroPairs.push({ descricao, numero });
    }

    socket.on("listar", () => {
      const formattedData = descricaoNumeroPairs.map(pair => `${pair.descricao} - ${pair.numero}`).join('<br>');
      _celNum = descricaoNumeroPairs.map(pair => pair.numero);
      socket.emit("listarData", formattedData);
    });
  });

  socket.on("deletar", () => {
    const caminhoTokenDel = './tokens/' + _celNum;
    const removeDirectory = (dirPath) => {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
    
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          if (fs.statSync(filePath).isDirectory()) {
            removeDirectory(filePath);
          } else {
            try {
              fs.unlinkSync(filePath);
            } catch (error) {
              console.error(`Error deleting file: ${filePath}`, error);
            }
          }
        }
    
        try {
          fs.rmdirSync(dirPath);
        } catch (error) {
          console.error(`Error deleting directory: ${dirPath}`, error);
        }
      }
    };
  
    removeDirectory(caminhoTokenDel);
  })
});
