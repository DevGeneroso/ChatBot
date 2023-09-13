import { create } from 'venom-bot';
import fs from 'fs';

var numcel;

export class VenomBot {

  #bots = [];

  static getInstance() {
    if (VenomBot.instance === undefined) VenomBot.instance = new VenomBot()
    return VenomBot.instance
  }

  fnLogQrCode(base64Qrimg, asciiQR, attempts, urlCode) {
    console.log("Number of attempts to read the qrcode: ", attempts);
    console.log("Terminal qrcode: ", asciiQR);
    //console.log('base64 image string qrcode: ', base64Qrimg);
    console.log("urlCode (data-ref): ", urlCode);
  }

  exportQrCode(base64Qr) {
    const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');

    var imageBuffer = response;
    fs.writeFile(
      './images/' + numcel + '.png',
      imageBuffer['data'],
      'binary',
      function (err) {
        if (err != null) {
          console.log(err);
        }
      }
    );
  }

  async init({ session, headless, useChrome }) {
    numcel = session;
    const bot = await create(
      session,
      this.exportQrCode,
      undefined,
      {
        session,
        headless,
        useChrome,
        multidevice: false,
        logQR: false,
        disableWelcome: true
      }
    );
    this.#bots.push({ session, bot });

    return bot;
  }

  findBySession(session = '') {
    return this.#bots.find(b => b.session === session)?.bot;
  }

  async sendText({ session = '', to, message }) {
    const bot = this.findBySession(session);
    if (!bot) throw new Error('VenomBot not initialized.');
    return await bot.sendText(to, message).catch(error => {
      console.error('Erro ao enviar mensagens: {}', error);
    });
  }
}