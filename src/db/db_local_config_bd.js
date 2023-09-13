import { createPool } from "mysql2";

let pool = null;

const getPool = () => {
  pool = pool
    ? pool
    : createPool({
      host: "mysql44-farm2.uni5.net",
      user: "totalsistemas26",
      password: "wtpT0talzap",
      database: "totalsistemas26",
      connectionLimit: 10,
    });
  return pool;
};

const findServentiaByCodigoTj = (codigoTj = 0) => {
  return getPool()
    .promise()
    .query("SELECT * FROM serventias WHERE ATIVO = 'S' AND CODIGO_TJ = ?", [codigoTj]);
};

const findServentiaByNumCel = (numCel = "") => {
  return getPool()
    .promise()
    .query("SELECT * FROM serventias WHERE ATIVO = 'S' AND NUM_CEL = ?", [numCel]);
};

const findValidNumsCel = () => {
  return getPool()
    .promise()
    .query("SELECT NUM_CEL FROM serventias WHERE ATIVO = 'S' AND NUM_CEL IS NOT NULL");
  //.query("SELECT NUM_CEL FROM serventias WHERE ATIVO = 'S' AND CODIGO_TJ = 9999 AND NUM_CEL IS NOT NULL");
};

const findValidToken = () => {
  return getPool()
    .promise()
    .query("SELECT CODIGO_TJ, NUM_CEL, TOKEN FROM serventias WHERE ATIVO = 'S' AND TOKEN IS NOT NULL");
}

const findValidLogin = (login, senha) => {
  return getPool()
    .promise()
    .query("SELECT LOGIN, SENHA FROM config WHERE LOGIN = ?" + " AND SENHA = ?", [login, senha]);
}

const findValidDescription = (numCel) => {
  return getPool()
    .promise()
    .query("SELECT DESCRICAO FROM serventias WHERE ATIVO = 'S' AND NUM_CEL = ?", [numCel])
    .then(([rows]) => {
      if (rows.length > 0) {
        return rows[0].DESCRICAO;
      } else {
        return null;
      }
    });
}

const findFirstLevelMenu = (serventiaId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT B.*, A.ACAO, A.TITULO
            FROM botmenu B 
            INNER JOIN acao_retorno A ON A.ID = B.ACAO_MENU_ID
            WHERE B.SERVENTIA_ID = ? AND B.MENU_PAI_ID IS NULL`,
      [serventiaId]
    );
};

const findMenu = (serventiaId = 0, menuPaiId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT B.*, A.ACAO, A.TITULO
            FROM botmenu B 
            INNER JOIN acao_retorno A ON A.ID = B.ACAO_MENU_ID
            WHERE B.SERVENTIA_ID = ? AND B.MENU_PAI_ID = ?`,
      [serventiaId, menuPaiId]
    );
};

const findServentiasBdConfig = (serventiaId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT C.*
            FROM serventia_bd_config C 
            WHERE C.SERVENTIA_ID = ?`,
      [serventiaId]
    );
};

const updateNumber = (codigoTJ, numCel) => {
  return getPool()
    .promise()
    .query(
      'UPDATE serventias SET NUM_CEL = ' + numCel + ' WHERE CODIGO_TJ = ' + codigoTJ
    );
}

export {
  findMenu,
  findFirstLevelMenu,
  findServentiaByCodigoTj,
  findServentiasBdConfig,
  findServentiaByNumCel,
  findValidNumsCel,
  findValidToken,
  updateNumber,
  findValidDescription,
  findValidLogin,
};
