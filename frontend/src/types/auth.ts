export type JwtPayload = {
    preferred_username: string;

    exp?: number;

    roles?: string[];
};

export type TokenResponse = {
    access_token: string;
    accessToken?: string;
    expires_in?: number;
    token_type?: string;
    tokenType?: string;
};
