import express from 'express'
import Sequelize from 'sequelize'
import FeedModelBuilder, { lengths } from './FeedModel.mjs'
import axios from 'axios'
import * as cheerio from 'cheerio'
import morgan from 'morgan'
import { trim, truncate, slugify, cleanify, sanitize, isValidUrl } from './strings.mjs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'
import * as env from './env.mjs'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

const cleanNameStr = (n) => slugify(truncate(cleanify(sanitize(trim(n))), lengths.name))
const cleanUrlStr = (u) => truncate(trim(u), lengths.url)
const cleanTitleStr = (t) => truncate(cleanify(trim(t)), lengths.title)
const cleanDescriptionStr = (d) => truncate(cleanify(trim(d)), lengths.description)
const cleanSearchStr = (d) => cleanify(sanitize(trim(d)))

const sequelize = new Sequelize(env.DATABASE_URL, {
    timezone: env.TZ,
    dialectOptions: {
        timezone: env.TZ, // Duplicate because of a bug: https://github.com/sequelize/sequelize/issues/10921
    },
    logging: false,
})

axios.interceptors.response.use((response) => {
    const chardetResult = jschardet.detect(response.data)
    const encoding = chardetResult?.encoding || charset(response.headers, response.data)

    response.data = iconv.decode(response.data, encoding)

    return response
})

sequelize
    .authenticate()
    .then(() => {
        console.log(`Connection to database « ${sequelize.getDatabaseName()} » has been established successfully`)
    })
    .catch((err) => {
        console.error(`Unable to connect to database`, err)
        throw err
    })
    .then(() => {
        const { findByName, list, insert, remove, count, search, suggest } = FeedModelBuilder(sequelize)

        const app = express()
        app.set('view engine', 'ejs')
        app.set('views', 'src/views')

        app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
        app.use(cors())

        const __dirname = dirname(fileURLToPath(import.meta.url))
        app.use(
            '/static',
            express.static(__dirname + '/static', {
                index: false,
                maxAge: DAY * 90,
            })
        )

        app.get('/', (req, res) => {
            const rootUrl = env.ROOT_URL || req.protocol + '://' + req.get('host')
            const n = req.query.name || req.query.n

            const name = cleanNameStr(n)
            const limit = Math.abs(parseInt(req.query.limit || req.query.l, 10)) || 25
            if (name) {
                if (n !== name) return res.redirect(302, `./?n=${name}`)

                return findByName({ name, limit }).then((entries) => {
                    res.type('text/xml')
                    return res.render('rss', {
                        rootUrl,
                        public: env.PUBLIC,
                        title: name,
                        titleWithFeedName: false,
                        url: `/?n=${name}`,
                        entries,
                    })
                })
            }
            res.set('Cache-control', `public, max-age=${DAY}`)
            return res.render('index', { rootUrl, public: env.PUBLIC, lengths })
        })

        if (!env.PUBLIC) {
            console.log('enable /list')
            app.get('/list', (req, res) =>
                list().then((feeds) => {
                    res.set('Cache-control', `public, max-age=${MINUTE}`)
                    res.render('list', { feeds })
                })
            )

            console.log('enable /search')
            app.get('/search', (req, res) => {
                const rootUrl = env.ROOT_URL || req.protocol + '://' + req.get('host')
                const query = cleanSearchStr(req.query.query || req.query.q)
                if (!query) return res.status(404).end('404 : Missing query parameter')
                if (query.length < 2)
                    return res.status(400).end('400 : query parameter should be at least 2 characters')
                const limit = Math.abs(parseInt(req.query.limit || req.query.l, 10)) || 100
                return search({ query, limit }).then((entries) => {
                    res.type('text/xml')
                    return res.render('rss', {
                        rootUrl,
                        public: env.PUBLIC,
                        title: `${entries.length} result${entries.length > 1 ? 's' : ''} for search « ${query} »`,
                        titleWithFeedName: true,
                        url: `/search?q=${query}`,
                        entries,
                    })
                })
            })

            console.log('enable /suggest')
            app.get('/suggest', (req, res) => {
                const query = cleanSearchStr(req.query.query || req.query.q)
                if (!query) return res.status(404).end('404 : Missing query parameter')
                if (query.length < 2)
                    return res.status(400).end('400 : query parameter should be at least 2 characters')
                return suggest({ query }).then((results) => res.json(results))
            })
        }

        app.get('/add', (req, res) => {
            const name = cleanNameStr(req.query.name || req.query.n)
            const url = cleanUrlStr(req.query.url || req.query.u)
            const title = cleanTitleStr(req.query.title || req.query.t)
            const description = cleanDescriptionStr(req.query.description || req.query.d)

            if (!name || !url) return res.status(404).end('404 : Missing name or url parameter')

            const shouldLimitToWikipedia = env.PUBLIC && name === 'somename'
            if (!isValidUrl(url, shouldLimitToWikipedia)) return res.status(400).end('403 : Forbidden')
            return (
                title
                    ? Promise.resolve({ title, description })
                    : Promise.resolve().then(() =>
                          axios
                              .get(encodeURI(url), {
                                  responseType: 'arraybuffer',
                                  headers: {
                                      'User-Agent':
                                          'Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0',
                                  },
                                  timeout: 5_000,
                              })
                              .then((response = {}) => {
                                  const { status, data } = response
                                  if (status === 200) {
                                      const $ = cheerio.load(data, {
                                          normalizeWhitespace: true,
                                          xmlMode: false,
                                          decodeEntities: true,
                                      })

                                      const titleFromPage = $('head title').text() || $('body title').text()
                                      return {
                                          title: truncate(cleanify(titleFromPage), lengths.title),
                                          description: truncate(
                                              cleanify($('head meta[name=description]').attr('content')),
                                              lengths.description
                                          ),
                                      }
                                  }
                              })
                              .catch((error) => {
                                  console.log(error)
                              })
                      )
            )
                .then((metas = {}) => {
                    const { title, description } = metas
                    return insert({ name, url, title: title || url, description })
                })
                .then(() => res.redirect(302, `./?n=${name}`))
                .catch((err) => {
                    const msg = `Error while inserting '${url}' in '${name}'`
                    console.error(msg, err)
                    res.sendStatus(500).end(msg)
                })
        })

        app.get('/del', (req, res) => {
            const name = cleanNameStr(req.query.name || req.query.n)
            const url = cleanUrlStr(req.query.url || req.query.u)
            if (!name || !url) return res.status(404).end('404 : Missing name or url parameter')
            if (!isValidUrl(url)) res.status(400).end('400 : not an URL')
            return remove({ name, url })
                .then(() => res.redirect(302, `./?n=${name}`))
                .catch((err) => {
                    const msg = `Error while removing '${url}' in '${name}'`
                    console.error(msg, err)
                    res.sendStatus(500).end(msg)
                })
        })

        app.get('/count', (req, res) => {
            const name = cleanNameStr(req.query.name || req.query.n)
            if (!name) return res.status(404).end('404 : Missing name parameter')
            return count({ name }).then(([count]) => res.json(count))
        })

        app.listen(env.PORT, () => {
            console.log(`rsstodolist-node-server listening at http://127.0.0.1:${env.CONTAINER_EXT_PORT || env.PORT}`)
        })
    })
