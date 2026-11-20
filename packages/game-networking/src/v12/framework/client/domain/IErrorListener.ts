import { ErrorBase } from "../../shared/types";

export interface IErrorListener {
  onError: (cb: (error: ErrorBase) => void | Promise<void>) => () => void;
  offError: (cb: (error: ErrorBase) => void | Promise<void>) => void;
}
