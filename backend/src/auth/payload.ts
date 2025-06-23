import { Request } from "express";
import { ReturnUserDto } from "../model/dtos";

export interface IPayload {
    usuario: ReturnUserDto;
}

export interface RequestWithPayload extends Request {
    payload: IPayload;
  }