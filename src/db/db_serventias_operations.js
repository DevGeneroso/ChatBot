import { createConnection } from 'mysql2';

const getConn = ({  host = '', user = '', password = '', database = ''}) => {
    return createConnection({  host, user, password, database })
}

const findRgi = (searchParam = '', conn) => {
    return conn.promise().query("SELECT *," +
    "DATE_FORMAT(DATA_PROTOCOLO, '%d/%m/%Y') AS DATA_ENTRADA, " +
    "DATE_FORMAT(DATA_REGISTRO, '%d/%m/%Y') AS DATA_PRATICA " +
    `FROM rgi WHERE PROTOCOLO='${searchParam}' OR TALAO='${searchParam}';`);
}

const findFirmas = (searchParam = '', conn) => {
    return conn.promise().query(`SELECT NOME, 
        DATE_FORMAT(DT_CADASTRO, '%d/%m/%Y') AS DATA_CADASTRO 
        FROM firmas 
        WHERE CPF_CGC='${searchParam}'`)
}

export { 
    getConn as getServentiasConn, findRgi, findFirmas 
};