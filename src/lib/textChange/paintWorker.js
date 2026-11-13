import { bakeCore } from './strokeCore'

// Bakes one watercolour stroke and hands the pixels back without copying them.
self.onmessage = (e) => {
  const r = bakeCore(e.data)
  self.postMessage({ id: e.data.id, ...r }, [r.wet.data.buffer, r.matte.data.buffer])
}
