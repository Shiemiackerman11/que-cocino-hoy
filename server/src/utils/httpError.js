export class HttpError extends Error {
    constructor(status, message, codigo) {
        super(message);
        this.status = status;
        this.codigo = codigo;
    }
}
