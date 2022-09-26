export type AsyncCallbackPayload<T> = T | { error: string };

const asyncCallbacks: Map<string, (payload: string) => void> = new Map();

export const createAsyncCallback = (cb: (payload: AsyncCallbackPayload<any>) => void) => {
  const id = Math.floor(Math.random() * 9999).toString();

  asyncCallbacks.set(id, (payload: string) => {
    asyncCallbacks.delete(id);

    const parsed = JSON.parse(payload);

    cb(parsed);
  });

  return id;
};

export const resolveAsyncCallback = (asyncId: string, payload: string) => {
  const cb = asyncCallbacks.get(asyncId);

  if (!cb) return console.warn("Game server responded to async socket request " + asyncId + " but no callback was available for it");

  cb(payload);
}