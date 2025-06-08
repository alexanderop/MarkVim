import { After, Before, setWorldConstructor } from '@cucumber/cucumber'
import { CustomWorld } from './world.js'

Before(async function (this: CustomWorld) {
  await this.initBrowser()
  await this.page.goto('http://localhost:3000')
  // Clear localStorage to ensure clean state
  await this.page.evaluate(() => localStorage.clear())
})

After(async function (this: CustomWorld) {
  await this.closeBrowser()
})

setWorldConstructor(CustomWorld)
