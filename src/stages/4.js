import { STAGES } from "./index.js";
import { getStage, stages } from "../stages.js";
import { findServentiasBdConfig } from "../db/db_local_config_bd.js";
import { storage } from "../storage.js";
import { VenomBot } from "../venom.js";
import {
  findFirmas,
  findRgi,
  getServentiasConn,
} from "../db/db_serventias_operations.js";

const endMessage =
  `-----------------------------\n` +
  '\nCaso deseje iniciar outro atendimento, digite "MENU".\nOu caso deseje encerrar o atendimento, digite "SAIR".';

const printRgi = async (resultRows, from, bot, to) => {
  const row = resultRows[0];
  let msg =
    `Protocolo: ${row.PROTOCOLO}\n` +
    `Talão: ${row.TALAO}\n` +
    `Status: ${row.STATUS}\n` +
    `Natureza: ${row.DESC_NATUREZA}\n` +
    `Apresentante: ${row.NOME_APRESENTANTE}\n` +
    `Data de Entrada: ${row.DATA_ENTRADA}\n` +
    `Data da Prática: ${row.DATA_PRATICA}\n${endMessage}`;
  await bot.sendText({ session: to, to: from, message: msg });
};

const printFirmas = async (resultRows, from, bot, to) => {
  const row = resultRows[0];
  let msg =
    `Nome: ${row.NOME}\n` +
    `Data Cadastro: ${row.DATA_CADASTRO}\n` +
    `\n${endMessage}`;
  await bot.sendText({ session: to, to: from, message: msg });
};

export const stageFour = {
  async exec({ from, message, to }) {
    const bot = VenomBot.getInstance();
    const { serventia, action, lastMsg } = storage[from];
    const [rows] = await findServentiasBdConfig(serventia.ID);
    if (rows.length == 0) {
      bot.sendText({
        session: to,
        to: from,
        message: `Informações necessárias para a consulta dos dados da Serventia não encontradas.\nEntre em contato com o cartório.\n${endMessage}`,
      });
      storage[from].stage = STAGES.END_STAGE;
    } else {
      if (message.toUpperCase() === "MENU") {
        storage[from].stage = STAGES.WELCOME;
        const currentStage = getStage({ from });

        await stages[currentStage].stage.exec({ from, to });
      } else {
        const pattern = /[0-9]{1,}/;
        const valid = pattern.test(message);
        if (!valid) {
          await bot.sendText({
            session: to,
            to: from,
            message: "Opção inválida, apenas números são válidos.",
          });
          await bot.sendText({ session: to, to: from, message: lastMsg });
        } else {
          console.log("Executar query {}...", action);
          const config = rows[0];
          const conn = await getServentiasConn({
            host: config.HOST,
            user: config.USER,
            database: config.BD_NAME,
            password: config.BD_PASS,
          });
          let queryPromise = null;
          let resultFn = null;
          if (action.includes("RGI")) {
            queryPromise = findRgi(message, conn);
            resultFn = printRgi;
          } else if (action.includes("FIRMAS")) {
            queryPromise = findFirmas(message, conn);
            resultFn = printFirmas;
          }

          if (queryPromise && resultFn) {
            try {
              const [responseRows] = await queryPromise;
              if (responseRows.length === 0) {
                await bot.sendText({
                  session: to,
                  to: from,
                  message: `Nenhum resultado encontrado. Tente novamente \nou digite "MENU" se quiser retornar ao menu de opções:'`,
                });
                await bot.sendText({ session: to, to: from, message: lastMsg });
              } else {
                storage[from].stage = STAGES.END_STAGE;
                await resultFn(responseRows, from, bot, to);
              }
            } catch (error) {
              console.log(error);
            } finally {
              conn.end();
            }
          } else {
            conn.end();
          }
        }
      }
    }
  },
};
