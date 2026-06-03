let getAccessTokenFn: () => string | null = () => null;
let setAccessTokenFn: (token: string) => void = () => {};
let clearSessionFn: () => void = () => { window.location.href = '/auth'; };

export const tokenManager = {
    getToken: () => getAccessTokenFn(),
    setToken: (token: string) => setAccessTokenFn(token),
    clearSession: () => clearSessionFn(),
    inject: (
        getFn: () => string | null,
        setFn: (token: string) => void,
        clearFn: () => void
    ) => {
        getAccessTokenFn = getFn;
        setAccessTokenFn = setFn;
        clearSessionFn = clearFn;
    }
};
