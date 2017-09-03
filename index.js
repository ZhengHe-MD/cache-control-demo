const http = require('http')
const url = require('url')
const path = require('path')
const morgan = require('morgan')

const hostname = '127.0.0.1'
const port = 3000
const logger = morgan('short')

const server = http.createServer((req, res) => {
  logger(req, res, function(err) {
    if (err) {
      res.statusCode = 500
      res.end()
    } else {
      handleRequest(req, res)
    }
  })
})

function handleNoStore(req, res) {
  // open chrome://cache. nothing found
  res.statusCode = 200
  res.setHeader('Cache-Control', 'no-store')
  res.end('no store page')
}

function handleNoCache(req, res) {
  // open chrome://cache. found http://localhost:3000/no-cache
  const etag = '00bc63c3a47875d37eb7004340988ca4'
  const ifNoneMatch = req.headers['if-none-match']
  if (ifNoneMatch === etag) {
    res.statusCode = 304
    res.end()
  } else {
    res.statusCode = 200
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Etag', etag)
    res.end('no cache page')
  }
}

function handleZeroMaxAge(req, res) {
  const etag = '28335d48c8ca388e4dd927c063e3723f'
  const ifNoneMatch = req.headers['if-none-match']
  if (ifNoneMatch === etag) {
    res.statusCode = 304
    res.end()
  } else {
    res.statusCode = 200
    res.setHeader('Cache-Control', 'max-age=0')
    // res.setHeader('Cache-Control', 'max-age=0, must-revalidate')
    res.setHeader('Etag', etag)
    res.end('zero max age page')
  }
}

function handlePositiveMaxAge(req, res) {
  // open the same url in a new tab. Reload a tab will trigger a
  // revalidation even if the copy in cache is not stale
  const etag = '7740a362f5773e77efdb601ea1e0c3b7'
  const ifNoneMatch = req.headers['if-none-match']
  if (ifNoneMatch === etag) {
    res.statusCode = 304
    res.end()
  } else {
    res.statusCode = 200
    res.setHeader('Cache-Control', 'max-age=10')
    res.setHeader('Etag', etag)
    res.end('positive max age')
  }
}

function handleLastModified(req, res) {
  const ifModifiedSince = req.headers['if-modified-since']
  if (ifModifiedSince) {
    res.statusCode = 304
    res.end()
  } else {
    const lastModified = Date()
    res.statusCode = 200
    res.setHeader('Cache-Control', 'max-age=0')
    res.setHeader('Last-Modified', lastModified)
    res.end('last modified page')
  }
}

function handleExample1(req, res) {
  res.statusCode = 200
  res.setHeader('Cache-Control', 'max-age=0, private, must-revalidate')
  res.end('example 1')
}

function handleExample2(req, res) {
  res.statusCode = 200
  res.setHeader('Cache-Control', 'max-age=86400, public')
  res.end('example 2')
}

function handleRequest(req, res) {
  const reqMethod = req.method
  const reqUrl = req.url
  const pathname = url.parse(reqUrl).pathname

  pathnameToHandler = {
    '/no-store': handleNoStore,
    '/no-cache': handleNoCache,
    '/zero-max-age': handleZeroMaxAge,
    '/positive-max-age': handlePositiveMaxAge,
    '/last-modified': handleLastModified,
    '/example-1': handleExample1,
    '/example-2': handleExample2
  }

  const handler = pathnameToHandler[pathname]
  if (!!handler) {
    handler(req, res)
  } else {
    res.statusCode = 404
    res.end('page no found')
  }
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
