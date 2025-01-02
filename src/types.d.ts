import { Request } from 'express';
import { Session, SessionData } from 'express-session';
import { Activity } from './interfaces/Activity';
import { Account } from './interfaces/Account';
import { Asset } from './interfaces/Asset';
import { Current } from './interfaces/Current';
import { World } from './interfaces/World';
import { Listing } from './interfaces/Listing';
import { Auth } from './interfaces/Auth';
import { Post } from './interfaces/Post';

declare module 'express-session' {
  interface SessionData {
    username: string;
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}

export {
  Activity,
  Account,
  Asset,
  Current,
  World,
  Listing,
  Auth,
  Post
};