import type { MarkVimWorld } from './world.js'

export async function ensurePage(world: MarkVimWorld) {
  if (!world.page) {
    await world.init()
  }
  if (!world.page) {
    throw new Error('Page not initialized')
  }
  return world.page
}
