import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientReady = () => true;
const getServerReady = () => false;

const useClientReady = () => useSyncExternalStore(subscribe, getClientReady, getServerReady);

export { useClientReady };
