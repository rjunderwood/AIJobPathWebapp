interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}

class KVClient {
  private getNamespace(): KVNamespace {
    // In production with Cloudflare Workers
    if (typeof globalThis !== 'undefined' && 'CACHE' in globalThis) {
      return (globalThis as any).CACHE as KVNamespace
    }
    
    // In development, use in-memory cache
    const memoryCache = new Map<string, { value: string; expiry?: number }>()
    
    return {
      get: async (key: string) => {
        const item = memoryCache.get(key)
        if (!item) return null
        if (item.expiry && item.expiry < Date.now()) {
          memoryCache.delete(key)
          return null
        }
        return item.value
      },
      put: async (key: string, value: string, options?: { expirationTtl?: number }) => {
        const expiry = options?.expirationTtl 
          ? Date.now() + (options.expirationTtl * 1000)
          : undefined
        memoryCache.set(key, { value, expiry })
      },
      delete: async (key: string) => {
        memoryCache.delete(key)
      },
      list: async (options?: { prefix?: string }) => {
        const keys = Array.from(memoryCache.keys())
          .filter(key => !options?.prefix || key.startsWith(options.prefix))
          .map(name => ({ name }))
        return { keys }
      }
    }
  }
  
  async get(key: string): Promise<string | null> {
    try {
      const namespace = this.getNamespace()
      return await namespace.get(key)
    } catch (error) {
      console.error('KV get error:', error)
      return null
    }
  }
  
  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    try {
      const namespace = this.getNamespace()
      await namespace.put(key, value, options)
    } catch (error) {
      console.error('KV put error:', error)
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      const namespace = this.getNamespace()
      await namespace.delete(key)
    } catch (error) {
      console.error('KV delete error:', error)
    }
  }
}

export const kv = new KVClient()