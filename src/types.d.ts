import { Request } from 'express';
import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    username: string
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}

export interface Activity {
  type: string;
  id: string;
  of: string;
  from: string;
  to: string;
  amount: number;
  note: string;
  times: {
      created: number;
      completed?: number;
  };
}

export interface Account {
  id: string;
  credits: {
      balance: number;
  };
  bio?: string;
  times: {
      created?: number;
      lastActive?: number;
      edited?: number;
  };
}

export interface Asset {
  visual: any;
  id: string;
  owner: string;
  type: string;
  amount: number;
  properties?: {
      yield?: number;
      cap?: number;
      staked?: number;
  };
}

export interface Current {
  time: number;
  resources: {
      water: {
          balance: number;
          supplied: number;
      };
      mineral: {
          balance: number;
          supplied: number;
      };
      credits: {
          balance: number;
          supplied: number;
      };
  };
  activities: {
      pending: string[];
      completed: string[];
  };
  effects: {
      pending: string[];
      completed: string[];
      rejected: string[];
  };
  accounts: string[];
}

export interface World {
  interval: {
      minute: number;
      hour: number;
      day: number;
      year: number;
  };
  resources: {
      water: {
          balance: number;
          total: number;
          rateLo: number;
          rateHi: number;
      };
      mineral: {
          total: number;
          rateLo: number;
          rateHi: number;
      };
  };
  worldbank: {
      maxDeficit: number;
  };
  items: {
      bankstone: {
          rateLo: number;
          rateHi: number;
          capLo: number;
          capHi: number;
      };
  };
}

export interface Listing {
  id: string;
  item: string;
  price: number;
  owner: string;
  amount: number;
  times: {
      created: number;
      lastUpdated: number;
      expired?: number;
      sold?: number;
  };
}

export interface Auth {
  username: string;
  password: string;
}

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  channels: string[];
  likes: number;
  dislikes: number;
  times: {
      created: number;
  };
  comments: Array<{
      comment: string;
      author: string;
      time: number;
      likes: number;
      dislikes: number;
  }>;
}