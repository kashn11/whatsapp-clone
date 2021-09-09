import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { combinedReducers } from "./rootReducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/rootSaga";
import { refreshToken } from "../utils/refreshToken";
import { getAccessToken } from "../utils/accessToken";
import { setAuthFailed, setAuthSuccess } from "./reducers/auth";
import { getActiveSocket, initializeSocket } from "./sockets/socketConnection";

const sagaMiddleware = createSagaMiddleware();

const middleware = [logger, sagaMiddleware];

const store = configureStore({
  reducer: combinedReducers,
  middleware,
});

// Re-Auth of returning user
(async () => {
  await refreshToken();
  const accessToken = getAccessToken();

  if (!accessToken) {
    store.dispatch(setAuthFailed(null));
  } else {
    await initializeSocket();
    const socket = getActiveSocket();
    await socket.on("signInSuccess", (payload: any) => {
      store.dispatch(setAuthSuccess(payload));
    });
  }
})();

sagaMiddleware.run(rootSaga);

export default store;
