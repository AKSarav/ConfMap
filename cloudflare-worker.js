// Cloudflare Worker for ConfMap reverse proxy
// This worker handles routing from confmap.com to confql.com

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetDomain = 'https://confql.com'
  
  // Route confmap.com/ to confql.com/confmap.html
  if (url.pathname === '/' || url.pathname === '') {
    return fetch(`${targetDomain}/confmap.html`, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  // Route confmap.com/map to confql.com/map.html
  if (url.pathname === '/map') {
    return fetch(`${targetDomain}/map.html`, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  // Route confmap.com/map.html to confql.com/map.html
  if (url.pathname === '/map.html') {
    return fetch(`${targetDomain}/map.html`, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  // Route confmap.com/confmap.html to confql.com/confmap.html
  if (url.pathname === '/confmap.html') {
    return fetch(`${targetDomain}/confmap.html`, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  // For all other paths, proxy to the same path on confql.com
  return fetch(`${targetDomain}${url.pathname}${url.search}`, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
}
