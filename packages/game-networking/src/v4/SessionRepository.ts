export type Session = {
  authId: string;
  gameId?: string;
};

export class SessionRepository {
  private _sessions: Record<string, Session> = {};

  startSession = (authId: string) => {
    const found = this._sessions[authId];

    if (found) {
      throw new Error(`Session already exists: ${authId}`);
    }

    this._sessions[authId] = { authId };
  };

  stopSession = (authId: string) => {
    const found = this._sessions[authId];
    if (!found) return;

    delete this._sessions[authId];
  };

  getSession = (authId: string): Session | undefined => {
    return this._sessions[authId];
  };
}
