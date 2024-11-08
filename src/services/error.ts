import { Response } from "undici";

export class APIError extends Error {
  status: number;
  statusText: string;
  #response: Response;

  constructor(response: Response) {
    super("API Error occurred");
    this.name = "APIError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.#response = response;
  }

  async json() {
    return await this.#response.json();
  }
}
