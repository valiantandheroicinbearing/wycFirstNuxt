import test from 'ava'
import { Nuxt, Builder } from 'nuxt'
import { resolve } from 'path'

// We keep a reference to Nuxt so we can close
// the server at the end of the test
let nuxt = null

// Init Nuxt.js and start listening on localhost:4000
test.before('Init Nuxt.js', async t => {
    const rootDir = resolve(__dirname, '..')
    let config = {}
    try { config = require(resolve(rootDir, 'nuxt.config.js')) } catch (e) { }
    config.rootDir = rootDir // project folder
    config.dev = false // production build
    config.mode = 'universal' // Isomorphic application
    nuxt = new Nuxt(config)
    await new Builder(nuxt).build()
    nuxt.listen(4000, 'localhost')
})

// Example of testing only generated html
test('/test', async t => {
    let context = {}
    const { html } = await nuxt.renderRoute('/test', context)
    t.true(html.includes('<h1 class="red">Hello world!</h1>'))
})

// Example of testing via DOM checking
test('/', async t => {
    const window = await nuxt.renderAndGetWindow('http://localhost:4000/test')
    const element = window.document.querySelector('.red')
    t.not(element, null)
    t.is(element.textContent, 'Hello world!')
    t.is(element.className, 'red')
    t.is(window.getComputedStyle(element).color, 'red')
})

// Close the Nuxt server
test.after('Closing server', t => {
    nuxt.close()
})