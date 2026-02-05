export interface Playlist {
    id: string;
    name: string;
    description?: string;
    userId: string;
    songIds: number[];
    createdAt: string;
    updatedAt: string;
}
