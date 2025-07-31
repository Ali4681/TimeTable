  // types/room.ts

  export interface IRoom {
    _id: string;
    name: string;
    capacity: number;
    modules?: string[]; // Made optional
    theoretical: boolean;
  }

  export interface ILinkToRoom {
    sessionTimeId: string;
    moduleId: string;
    roomId: string;
  }

  export interface IRoomCreate {
    name: string;
    capacity: number;
    theoretical: boolean;
  }

  export interface IRoomUpdate extends Partial<IRoomCreate> {}
