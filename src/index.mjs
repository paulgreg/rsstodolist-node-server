import express from 'express'
import Sequelize from 'sequelize'
import FeedModelBuilder, { lengths } from './FeedModel.mjs'
import axios from 'axios'
import cheerio from 'cheerio'
import morgan from 'morgan'
import { trim, truncate, slugify, cleanify } from './strings.mjs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'
import * as env from './env.mjs'

const MINUTE = 60
const HOUR = MINUTE * 60
const HALF_DAY = HOUR * 12

const cleanNameStr = (n) => slugify(truncate(cleanify(trim(n)), lengths.name))
const cleanUrlStr = (u) => truncate(trim(u), lengths.url)
const cleanTitleStr = (t) => truncate(cleanify(trim(t)), lengths.title)
const cleanDescriptionStr = (d) => truncate(cleanify(trim(d)), lengths.description)

const sequelize = new Sequelize(env.DB_URL, {
    timezone: env.TZ,
    dialectOptions: {
        timezone: env.TZ, // Duplicate because of a bug: https://github.com/sequelize/sequelize/issues/10921
    },
    logging: false,
})

axios.interceptors.response.use((response) => {
    const chardetResult = jschardet.detect(response.data)
    const encoding = (chardetResult && chardetResult.encoding) || charset(response.headers, response.data)

    response.data = iconv.decode(response.data, encoding)

    return response
})

sequelize
    .authenticate()
    .then(() => {
        console.log(`Connection to database has been established successfully`)
    })
    .catch((err) => {
        console.error(`Unable to connect to database`, err)
        throw err
    })
    .then(() => {
        const { findByName, list, insert, remove } = FeedModelBuilder(sequelize)

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
                maxAge: HALF_DAY * 1000,
            })
        )

        app.get('/', (req, res) => {
            const rootUrl = env.ROOT_URL || req.protocol + '://' + req.get('host')
            const n = req.query.name || req.query.n
            const name = cleanNameStr(n)
            const limit = Math.abs(parseInt(req.query.limit || req.query.l, 10)) || 25
            const max = 500
            if (name) {
                if (n !== name) return res.redirect(302, `./?n=${name}`)

                return findByName({ name, limit: limit > max ? max : limit }).then((entries) => {
                    res.type('text/xml')
                    return res.render('rss', {
                        rootUrl,
                        public: env.PUBLIC,
                        name,
                        entries,
                    })
                })
            }
            res.set('Cache-control', `public, max-age=${HALF_DAY}`)
            return res.render('index', { rootUrl, public: env.PUBLIC })
        })

        if (!env.PUBLIC) {
            console.log('enable /list')
            app.get('/list', (req, res) =>
                list().then((feeds) => {
                    res.render('list', { feeds })
                })
            )
        }

        app.get('/add', (req, res) => {
            const n = req.query.name || req.query.n
            const name = cleanNameStr(n)
            const url = cleanUrlStr(req.query.url || req.query.u)
            const title = cleanTitleStr(req.query.title || req.query.t)
            const description = cleanDescriptionStr(req.query.description || req.query.d)

            if (!name || !url) {
                return res.status(404).end('404 : Missing name or url')
            }
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
                              })
                              .then(function (response = {}) {
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
                              .catch(function (error) {
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
            if (!name || !url) {
                return res.status(404).end('404 : Missing name or url')
            }
            return remove({ name, url })
                .then(() => res.redirect(302, `./?n=${name}`))
                .catch((err) => {
                    const msg = `Error while removing '${url}' in '${name}'`
                    console.error(msg, err)
                    res.sendStatus(500).end(msg)
                })
        })

        app.listen(env.PORT, () => {
            console.log(`rsstodolist-node-server listening at http://localhost:${env.CONTAINER_EXT_PORT || env.PORT}`)
        })
    })
