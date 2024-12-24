import { Response } from "undici";

export class APIError extends Error {
  status: number;
  statusText: string;
  json?: unknown;
  #response: Response;

  constructor(response: Response) {
    super("API Error occurred");
    this.name = "APIError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.#response = response;
  }

  async setJson() {
    this.json = await this.#response.json();
    return this.json;
  }
}
