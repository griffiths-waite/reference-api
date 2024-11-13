export interface CustomErrorOpts {
  status: number;
  message: string;
  translation?: string;
  code?: string;
}

export class CustomError extends Error {
  private _status: number;
  private _translation?: string;
  private _code?: string;

  constructor(opts: CustomErrorOpts) {
    super(opts.message);

    this._status = opts.status;
    this._translation = opts.translation;
    this._code = opts.code;
  }

  get status(): number {
    return this._status;
  }

  get translation(): string | undefined {
    return this._translation;
  }

  get code(): string | undefined {
    return this._code;
  }
}

export const defaultError =
  "An error occurred whilst processing the request. Please try again later.";
